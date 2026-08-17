package com.sm3Agro.SM3AgroERP.production.service;

import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.inventory.service.InventoryStockService;
import com.sm3Agro.SM3AgroERP.production.dto.cut.CutResponse;
import com.sm3Agro.SM3AgroERP.production.dto.cut.LaunchCutRequest;
import com.sm3Agro.SM3AgroERP.production.entity.Cut;
import com.sm3Agro.SM3AgroERP.production.entity.Field;
import com.sm3Agro.SM3AgroERP.production.entity.ProductionBatch;
import com.sm3Agro.SM3AgroERP.production.enums.CutStatus;
import com.sm3Agro.SM3AgroERP.production.repository.CutRepository;
import com.sm3Agro.SM3AgroERP.production.repository.FieldRepository;
import com.sm3Agro.SM3AgroERP.production.repository.ProductionBatchRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RequiredArgsConstructor
@Service
public class CutService {

    private static final String CUT_CANCELLATION_ROOT_CAUSE = "Cancelamento de Corte";

    private final CutRepository cutRepository;
    private final FieldRepository fieldRepository;
    private final ProductRepository productRepository;
    private final ProductionBatchRepository productionBatchRepository;
    private final InventoryStockService inventoryStockService;

    public List<CutResponse> findAll() {
        return cutRepository.findAllByOrderByCutDateDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CutResponse launch(LaunchCutRequest request) {
        validateLaunchRequest(request);

        Field field = fieldRepository.findById(request.fieldId())
                .orElseThrow(() -> new EntityNotFoundException("Field not found: " + request.fieldId()));
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + request.productId()));

        if (product.getProductFamily() == null) {
            throw new IllegalArgumentException("Product must have a product family to launch a cut");
        }
        inventoryStockService.requireProductControlsStockForProduction(product, request.cutDate());

        Integer cutNumber = Math.toIntExact(
                cutRepository.countByFieldIdAndStatus(field.getId(), CutStatus.DONE) + 1
        );
        Integer daysSinceLastCut = resolveDaysSinceLastCut(field.getId(), request.cutDate());

        Cut cut = cutRepository.save(Cut.builder()
                .field(field)
                .productFamily(product.getProductFamily())
                .cutDate(request.cutDate())
                .cutNumber(cutNumber)
                .status(CutStatus.DONE)
                .observation(request.observation())
                .daysSinceLastCut(daysSinceLastCut)
                .build());

        String batchCode = buildBatchCode(product, request.cutDate(), cut.getId());
        InventoryStockService.StockMovementResult stockMovement = inventoryStockService.createProductionIn(
                product,
                batchCode,
                request.cutDate(),
                request.quantity(),
                request.unitCost()
        );

        productionBatchRepository.save(ProductionBatch.builder()
                .inventoryBatch(stockMovement.batch())
                .inventoryMovement(stockMovement.movement())
                .quantity(request.quantity())
                .qualityGrade(request.qualityGrade())
                .cut(cut)
                .observation(request.observation())
                .build());

        return toResponse(cut);
    }

    @Transactional
    public CutResponse cancel(Long cutId) {
        Cut cut = cutRepository.findById(cutId)
                .orElseThrow(() -> new EntityNotFoundException("Cut not found: " + cutId));

        if (cut.getStatus() == CutStatus.CANCELED) {
            throw new IllegalArgumentException("Cut is already canceled");
        }

        ProductionBatch productionBatch = productionBatchRepository.findByCutId(cutId)
                .orElseThrow(() -> new EntityNotFoundException("ProductionBatch not found for cut: " + cutId));
        InventoryBatch inventoryBatch = productionBatch.getInventoryBatch();
        InventoryMovement productionMovement = productionBatch.getInventoryMovement();

        inventoryStockService.cancelProductionStock(
                inventoryBatch,
                productionMovement,
                productionBatch.getQuantity(),
                LocalDate.now(),
                CUT_CANCELLATION_ROOT_CAUSE,
                "Cancelamento do corte #" + cut.getId()
        );
        cut.setStatus(CutStatus.CANCELED);

        cutRepository.save(cut);

        return toResponse(cut);
    }

    private void validateLaunchRequest(LaunchCutRequest request) {
        if (request.fieldId() == null) {
            throw new IllegalArgumentException("fieldId is required");
        }
        if (request.productId() == null) {
            throw new IllegalArgumentException("productId is required");
        }
        if (request.cutDate() == null) {
            throw new IllegalArgumentException("cutDate is required");
        }
        if (request.quantity() == null || request.quantity().signum() <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        if (request.unitCost() != null && request.unitCost().signum() < 0) {
            throw new IllegalArgumentException("unitCost must be greater than or equal to zero");
        }
    }

    private Integer resolveDaysSinceLastCut(Long fieldId, LocalDate cutDate) {
        return cutRepository
                .findTopByFieldIdAndStatusAndCutDateLessThanOrderByCutDateDescIdDesc(
                        fieldId,
                        CutStatus.DONE,
                        cutDate
                )
                .map(previous -> Math.toIntExact(ChronoUnit.DAYS.between(previous.getCutDate(), cutDate)))
                .orElse(null);
    }

    private String buildBatchCode(Product product, LocalDate cutDate, Long cutId) {
        return "PRD" + product.getId() + "-" + cutDate.toString().replace("-", "") + "-CUT" + cutId;
    }

    private CutResponse toResponse(Cut cut) {
        return productionBatchRepository.findByCutId(cut.getId())
                .map(productionBatch -> new CutResponse(
                        cut.getId(),
                        cut.getField().getId(),
                        productionBatch.getInventoryBatch().getProduct().getId(),
                        cut.getProductFamily().getId(),
                        productionBatch.getInventoryBatch().getId(),
                        productionBatch.getInventoryMovement().getId(),
                        productionBatch.getId(),
                        productionBatch.getInventoryBatch().getCode(),
                        cut.getCutDate(),
                        cut.getCutNumber(),
                        cut.getStatus(),
                        productionBatch.getQuantity(),
                        productionBatch.getInventoryMovement().getUnitCost(),
                        productionBatch.getQualityGrade(),
                        cut.getObservation(),
                        cut.getDaysSinceLastCut()
                ))
                .orElseGet(() -> new CutResponse(
                        cut.getId(),
                        cut.getField().getId(),
                        null,
                        cut.getProductFamily().getId(),
                        null,
                        null,
                        null,
                        null,
                        cut.getCutDate(),
                        cut.getCutNumber(),
                        cut.getStatus(),
                        null,
                        null,
                        null,
                        cut.getObservation(),
                        cut.getDaysSinceLastCut()
                ));
    }
}
