package com.sm3Agro.SM3AgroERP.production.cut.service;

import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.entity.InventoryAdjustment;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.stock.InventoryStockService;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.enums.InventoryAdjustmentType;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.repository.AdjustmentRootCauseRepository;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.repository.InventoryAdjustmentRepository;
import com.sm3Agro.SM3AgroERP.inventory.batch.repository.InventoryBatchRepository;
import com.sm3Agro.SM3AgroERP.inventory.movement.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.production.cut.dto.CutResponse;
import com.sm3Agro.SM3AgroERP.production.cut.dto.LaunchCutRequest;
import com.sm3Agro.SM3AgroERP.production.cut.entity.Cut;
import com.sm3Agro.SM3AgroERP.masterData.field.entity.Field;
import com.sm3Agro.SM3AgroERP.production.productionBatch.entity.ProductionBatch;
import com.sm3Agro.SM3AgroERP.production.cut.enums.CutStatus;
import com.sm3Agro.SM3AgroERP.production.cut.repository.CutRepository;
import com.sm3Agro.SM3AgroERP.masterData.field.repository.FieldRepository;
import com.sm3Agro.SM3AgroERP.production.productionBatch.repository.ProductionBatchRepository;
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
    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryAdjustmentRepository inventoryAdjustmentRepository;
    private final AdjustmentRootCauseRepository adjustmentRootCauseRepository;
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

        inventoryStockService.requireProductControlsStockForProduction(product, request.cutDate());

        Integer cutNumber = Math.toIntExact(
                cutRepository.countByFieldIdAndStatus(field.getId(), CutStatus.DONE) + 1
        );
        Integer daysSinceLastCut = resolveDaysSinceLastCut(field.getId(), request.cutDate());

        Cut cut = cutRepository.save(Cut.builder()
                .field(field)
                .product(product)
                .cutDate(request.cutDate())
                .cutNumber(cutNumber)
                .status(CutStatus.DONE)
                .observation(request.observation())
                .daysSinceLastCut(daysSinceLastCut)
                .build());

        String batchCode = buildBatchCode(product, request.cutDate(), cut.getId());
        InventoryBatch inventoryBatch = inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code(batchCode)
                .batchDate(request.cutDate())
                .status(InventoryBatchStatus.ACTIVE)
                .unitCost(request.unitCost())
                .quantity(request.quantity())
                .build());

        InventoryMovement inventoryMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.PRODUCTION_IN)
                .quantity(request.quantity())
                .unitCost(request.unitCost())
                .movementDate(request.cutDate())
                .build());

        productionBatchRepository.save(ProductionBatch.builder()
                .inventoryBatch(inventoryBatch)
                .inventoryMovement(inventoryMovement)
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

        if (inventoryMovementRepository.existsByBatchIdAndIdNot(inventoryBatch.getId(), productionMovement.getId())) {
            throw new IllegalArgumentException("Cut cannot be canceled because the generated batch has later movements");
        }

        InventoryMovement compensationMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.ADJUSTMENT_OUT)
                .quantity(productionBatch.getQuantity())
                .unitCost(productionMovement.getUnitCost())
                .movementDate(LocalDate.now())
                .build());

        inventoryAdjustmentRepository.save(InventoryAdjustment.builder()
                .type(InventoryAdjustmentType.NEGATIVE)
                .rootCause(resolveCancellationRootCause())
                .observation("Cancelamento do corte #" + cut.getId())
                .inventoryMovement(compensationMovement)
                .build());

        inventoryBatch.setQuantity(BigDecimal.ZERO);
        inventoryBatch.setStatus(InventoryBatchStatus.CANCELED);
        cut.setStatus(CutStatus.CANCELED);

        inventoryBatchRepository.save(inventoryBatch);
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

    private AdjustmentRootCause resolveCancellationRootCause() {
        return adjustmentRootCauseRepository.findByName(CUT_CANCELLATION_ROOT_CAUSE)
                .orElseGet(() -> adjustmentRootCauseRepository.save(AdjustmentRootCause.builder()
                        .name(CUT_CANCELLATION_ROOT_CAUSE)
                        .build()));
    }

    private CutResponse toResponse(Cut cut) {
        return productionBatchRepository.findByCutId(cut.getId())
                .map(productionBatch -> new CutResponse(
                        cut.getId(),
                        cut.getField().getId(),
                        cut.getProduct().getId(),
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
                        cut.getProduct().getId(),
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
