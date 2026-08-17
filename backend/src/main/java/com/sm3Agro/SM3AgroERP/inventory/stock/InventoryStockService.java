package com.sm3Agro.SM3AgroERP.inventory.stock;

import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.entity.InventoryAdjustment;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.enums.InventoryAdjustmentType;
import com.sm3Agro.SM3AgroERP.inventory.adjustment.repository.InventoryAdjustmentRepository;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.batch.repository.InventoryBatchRepository;
import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.inventory.movement.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.entity.AdjustmentRootCause;
import com.sm3Agro.SM3AgroERP.masterData.adjustmentRootCause.repository.AdjustmentRootCauseRepository;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@RequiredArgsConstructor
@Service
public class InventoryStockService {

    private final InventoryBatchRepository inventoryBatchRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
    private final InventoryAdjustmentRepository inventoryAdjustmentRepository;
    private final AdjustmentRootCauseRepository adjustmentRootCauseRepository;
    private final ProductRepository productRepository;

    public Optional<StockMovementResult> createFinancialMovement(
            FinancialTransactionType transactionType,
            Long transactionId,
            LocalDate issueDate,
            Long itemId,
            Long productId,
            BigDecimal quantity,
            BigDecimal inventoryUnitCost,
            Long inventoryBatchId
    ) {
        if (productId == null) {
            return Optional.empty();
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + productId));

        requireProductClassified(product);

        if (Boolean.FALSE.equals(product.getHasStock())) {
            return Optional.empty();
        }

        if (issueDate.isBefore(product.getStockControlStartDate())) {
            return Optional.empty();
        }

        if (transactionType == FinancialTransactionType.EXPENSE) {
            return Optional.of(createPurchaseIn(
                    product,
                    transactionId,
                    itemId,
                    quantity,
                    inventoryUnitCost,
                    issueDate
            ));
        }

        return Optional.of(createSaleOut(
                product,
                itemId,
                quantity,
                inventoryBatchId,
                issueDate
        ));
    }

    public StockMovementResult createProductionIn(
            Product product,
            String batchCode,
            LocalDate movementDate,
            BigDecimal quantity,
            BigDecimal unitCost
    ) {
        requireProductControlsStockForProduction(product, movementDate);
        requirePositiveQuantity(quantity);
        requireNonNegativeCost(unitCost, "unitCost");

        InventoryBatch inventoryBatch = inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code(batchCode)
                .batchDate(movementDate)
                .status(InventoryBatchStatus.ACTIVE)
                .unitCost(unitCost)
                .quantity(quantity)
                .build());

        InventoryMovement inventoryMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.PRODUCTION_IN)
                .quantity(quantity)
                .unitCost(unitCost)
                .movementDate(movementDate)
                .build());

        return new StockMovementResult(inventoryBatch, inventoryMovement);
    }

    public StockMovementResult cancelProductionStock(
            InventoryBatch inventoryBatch,
            InventoryMovement productionMovement,
            BigDecimal quantity,
            LocalDate movementDate,
            String rootCauseName,
            String observation
    ) {
        if (inventoryMovementRepository.existsByBatchIdAndIdNot(inventoryBatch.getId(), productionMovement.getId())) {
            throw new IllegalArgumentException("Cut cannot be canceled because the generated batch has later movements");
        }

        InventoryMovement compensationMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.ADJUSTMENT_OUT)
                .quantity(quantity)
                .unitCost(productionMovement.getUnitCost())
                .movementDate(movementDate)
                .build());

        inventoryAdjustmentRepository.save(InventoryAdjustment.builder()
                .type(InventoryAdjustmentType.NEGATIVE)
                .rootCause(resolveRootCause(rootCauseName))
                .observation(observation)
                .inventoryMovement(compensationMovement)
                .build());

        inventoryBatch.setQuantity(BigDecimal.ZERO);
        inventoryBatch.setStatus(InventoryBatchStatus.CANCELED);
        inventoryBatchRepository.save(inventoryBatch);

        return new StockMovementResult(inventoryBatch, compensationMovement);
    }

    public void requireProductControlsStockForProduction(Product product, LocalDate movementDate) {
        requireProductClassified(product);

        if (Boolean.FALSE.equals(product.getHasStock())) {
            throw new IllegalArgumentException("Product must control stock to launch a cut.");
        }

        if (movementDate.isBefore(product.getStockControlStartDate())) {
            throw new IllegalArgumentException("cutDate cannot be before product stockControlStartDate.");
        }
    }

    private StockMovementResult createPurchaseIn(
            Product product,
            Long transactionId,
            Long itemId,
            BigDecimal quantity,
            BigDecimal inventoryUnitCost,
            LocalDate movementDate
    ) {
        requirePositiveQuantity(quantity);
        requireInventoryUnitCost(inventoryUnitCost);

        InventoryBatch inventoryBatch = inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code("PUR-" + transactionId + "-ITEM-" + itemId)
                .batchDate(movementDate)
                .status(InventoryBatchStatus.ACTIVE)
                .unitCost(inventoryUnitCost)
                .quantity(quantity)
                .build());

        InventoryMovement inventoryMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.PURCHASE_IN)
                .quantity(quantity)
                .unitCost(inventoryUnitCost)
                .movementDate(movementDate)
                .financialTransactionItemId(itemId)
                .build());

        return new StockMovementResult(inventoryBatch, inventoryMovement);
    }

    private StockMovementResult createSaleOut(
            Product product,
            Long itemId,
            BigDecimal quantity,
            Long inventoryBatchId,
            LocalDate movementDate
    ) {
        requirePositiveQuantity(quantity);

        if (inventoryBatchId == null) {
            throw new IllegalArgumentException("inventoryBatchId is required for stock-controlled sales.");
        }

        InventoryBatch inventoryBatch = inventoryBatchRepository.findById(inventoryBatchId)
                .orElseThrow(() -> new EntityNotFoundException("InventoryBatch not found: " + inventoryBatchId));

        if (!inventoryBatch.getProduct().getId().equals(product.getId())) {
            throw new IllegalArgumentException("Inventory batch does not belong to the financial item product.");
        }

        if (inventoryBatch.getStatus() != InventoryBatchStatus.ACTIVE) {
            throw new IllegalArgumentException("Inventory batch is not available for sale.");
        }

        if (inventoryBatch.getQuantity().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Inventory batch does not have enough stock.");
        }

        InventoryMovement inventoryMovement = inventoryMovementRepository.save(InventoryMovement.builder()
                .batch(inventoryBatch)
                .movementType(InventoryMovementType.SALE_OUT)
                .quantity(quantity)
                .unitCost(inventoryBatch.getUnitCost())
                .movementDate(movementDate)
                .financialTransactionItemId(itemId)
                .build());

        BigDecimal remainingQuantity = inventoryBatch.getQuantity().subtract(quantity);
        inventoryBatch.setQuantity(remainingQuantity);
        if (remainingQuantity.compareTo(BigDecimal.ZERO) == 0) {
            inventoryBatch.setStatus(InventoryBatchStatus.SOLD);
        }
        inventoryBatchRepository.save(inventoryBatch);

        return new StockMovementResult(inventoryBatch, inventoryMovement);
    }

    private void requireProductClassified(Product product) {
        if (product.getHasStock() == null) {
            throw new IllegalArgumentException("Product must be classified for stock control before use.");
        }

        if (Boolean.TRUE.equals(product.getHasStock()) && product.getStockControlStartDate() == null) {
            throw new IllegalArgumentException("stockControlStartDate is required for stock-controlled products.");
        }
    }

    private void requirePositiveQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
    }

    private void requireInventoryUnitCost(BigDecimal inventoryUnitCost) {
        if (inventoryUnitCost == null) {
            throw new IllegalArgumentException("inventoryUnitCost is required for stock-controlled purchases.");
        }
        requireNonNegativeCost(inventoryUnitCost, "inventoryUnitCost");
    }

    private void requireNonNegativeCost(BigDecimal cost, String fieldName) {
        if (cost != null && cost.signum() < 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than or equal to zero");
        }
    }

    private AdjustmentRootCause resolveRootCause(String rootCauseName) {
        return adjustmentRootCauseRepository.findByName(rootCauseName)
                .orElseGet(() -> adjustmentRootCauseRepository.save(AdjustmentRootCause.builder()
                        .name(rootCauseName)
                        .build()));
    }

    public record StockMovementResult(
            InventoryBatch batch,
            InventoryMovement movement
    ) {
    }
}
