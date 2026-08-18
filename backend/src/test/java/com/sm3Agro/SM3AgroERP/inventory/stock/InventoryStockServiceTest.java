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
import com.sm3Agro.SM3AgroERP.masterData.product.enums.ProductType;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.stubbing.Answer;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryStockServiceTest {

    @Mock
    private InventoryBatchRepository inventoryBatchRepository;
    @Mock
    private InventoryMovementRepository inventoryMovementRepository;
    @Mock
    private InventoryAdjustmentRepository inventoryAdjustmentRepository;
    @Mock
    private AdjustmentRootCauseRepository adjustmentRootCauseRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryStockService service;

    @Test
    void shouldSkipFinancialMovementWhenItemHasNoProduct() {
        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.EXPENSE,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                null,
                new BigDecimal("2.00"),
                new BigDecimal("10.00"),
                null
        );

        assertTrue(result.isEmpty());
        verifyNoInteractions(
                productRepository,
                inventoryBatchRepository,
                inventoryMovementRepository,
                inventoryAdjustmentRepository,
                adjustmentRootCauseRepository
        );
    }

    @Test
    void shouldSkipFinancialMovementWhenProductDoesNotControlStock() {
        Product product = product(10L, false, null);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.EXPENSE,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                product.getId(),
                new BigDecimal("2.00"),
                new BigDecimal("10.00"),
                null
        );

        assertTrue(result.isEmpty());
        verifyNoInteractions(inventoryBatchRepository, inventoryMovementRepository);
    }

    @Test
    void shouldSkipFinancialMovementBeforeStockControlStartDate() {
        Product product = product(10L, true, LocalDate.of(2026, 7, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.EXPENSE,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                product.getId(),
                new BigDecimal("2.00"),
                new BigDecimal("10.00"),
                null
        );

        assertTrue(result.isEmpty());
        verifyNoInteractions(inventoryBatchRepository, inventoryMovementRepository);
    }

    @Test
    void shouldCreatePurchaseBatchAndMovementForStockControlledExpense() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.save(any(InventoryBatch.class))).thenAnswer(savedBatchWithId(300L));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(savedMovementWithId(400L));

        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.EXPENSE,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                product.getId(),
                new BigDecimal("2.50"),
                new BigDecimal("10.75"),
                null
        );

        ArgumentCaptor<InventoryBatch> batchCaptor = ArgumentCaptor.forClass(InventoryBatch.class);
        ArgumentCaptor<InventoryMovement> movementCaptor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryBatchRepository).save(batchCaptor.capture());
        verify(inventoryMovementRepository).save(movementCaptor.capture());

        InventoryBatch batch = batchCaptor.getValue();
        InventoryMovement movement = movementCaptor.getValue();
        assertTrue(result.isPresent());
        assertEquals(300L, result.orElseThrow().batch().getId());
        assertEquals(400L, result.orElseThrow().movement().getId());
        assertEquals(product, batch.getProduct());
        assertEquals("PUR-100-ITEM-200", batch.getCode());
        assertEquals(LocalDate.of(2026, 6, 20), batch.getBatchDate());
        assertEquals(InventoryBatchStatus.ACTIVE, batch.getStatus());
        assertEquals(0, new BigDecimal("10.75").compareTo(batch.getUnitCost()));
        assertEquals(0, new BigDecimal("2.50").compareTo(batch.getQuantity()));
        assertEquals(batch, movement.getBatch());
        assertEquals(InventoryMovementType.PURCHASE_IN, movement.getMovementType());
        assertEquals(0, new BigDecimal("2.50").compareTo(movement.getQuantity()));
        assertEquals(0, new BigDecimal("10.75").compareTo(movement.getUnitCost()));
        assertEquals(200L, movement.getFinancialTransactionItemId());
    }

    @Test
    void shouldCreateSaleMovementAndMarkBatchSoldWhenQuantityIsFullyConsumed() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("2.00"));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.findById(300L)).thenReturn(Optional.of(batch));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(savedMovementWithId(400L));
        when(inventoryBatchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.INCOME,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                product.getId(),
                new BigDecimal("2.00"),
                null,
                batch.getId()
        );

        ArgumentCaptor<InventoryMovement> movementCaptor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(movementCaptor.capture());
        verify(inventoryBatchRepository).save(batch);

        InventoryMovement movement = movementCaptor.getValue();
        assertTrue(result.isPresent());
        assertEquals(400L, result.orElseThrow().movement().getId());
        assertEquals(InventoryMovementType.SALE_OUT, movement.getMovementType());
        assertEquals(0, new BigDecimal("2.00").compareTo(movement.getQuantity()));
        assertEquals(0, new BigDecimal("5.25").compareTo(movement.getUnitCost()));
        assertEquals(200L, movement.getFinancialTransactionItemId());
        assertEquals(0, BigDecimal.ZERO.compareTo(batch.getQuantity()));
        assertEquals(InventoryBatchStatus.SOLD, batch.getStatus());
    }

    @Test
    void shouldCreateSaleMovementAndKeepBatchActiveWhenQuantityIsPartiallyConsumed() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("5.00"));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.findById(300L)).thenReturn(Optional.of(batch));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(savedMovementWithId(400L));
        when(inventoryBatchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Optional<InventoryStockService.StockMovementResult> result = service.createFinancialMovement(
                FinancialTransactionType.INCOME,
                100L,
                LocalDate.of(2026, 6, 20),
                200L,
                product.getId(),
                new BigDecimal("2.00"),
                null,
                batch.getId()
        );

        assertTrue(result.isPresent());
        assertEquals(0, new BigDecimal("3.00").compareTo(batch.getQuantity()));
        assertEquals(InventoryBatchStatus.ACTIVE, batch.getStatus());
    }

    @Test
    void shouldRejectUnclassifiedProductForFinancialMovement() {
        Product product = product(10L, null, null);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        new BigDecimal("10.00"),
                        null
                ));

        assertEquals("Product must be classified for stock control before use.", exception.getMessage());
        verify(inventoryBatchRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void shouldRejectStockControlledProductWithoutStartDate() {
        Product product = product(10L, true, null);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        new BigDecimal("10.00"),
                        null
                ));

        assertEquals("stockControlStartDate is required for stock-controlled products.", exception.getMessage());
    }

    @Test
    void shouldRejectFinancialMovementWithNonPositiveQuantity() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        BigDecimal.ZERO,
                        new BigDecimal("10.00"),
                        null
                ));

        assertEquals("quantity must be greater than zero", exception.getMessage());
        verify(inventoryBatchRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void shouldRejectMissingInventoryUnitCostForPurchase() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        null,
                        null
                ));

        assertEquals("inventoryUnitCost is required for stock-controlled purchases.", exception.getMessage());
    }

    @Test
    void shouldRejectNegativeInventoryUnitCostForPurchase() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        new BigDecimal("-0.01"),
                        null
                ));

        assertEquals("inventoryUnitCost must be greater than or equal to zero", exception.getMessage());
        verify(inventoryBatchRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void shouldRejectMissingBatchForStockControlledSale() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.INCOME,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        null,
                        null
                ));

        assertEquals("inventoryBatchId is required for stock-controlled sales.", exception.getMessage());
    }

    @Test
    void shouldRejectSaleWithBatchFromAnotherProduct() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        Product anotherProduct = product(20L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(anotherProduct, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("5.00"));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.findById(300L)).thenReturn(Optional.of(batch));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.INCOME,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        null,
                        batch.getId()
                ));

        assertEquals("Inventory batch does not belong to the financial item product.", exception.getMessage());
    }

    @Test
    void shouldRejectSaleWithUnavailableBatch() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.SOLD, BigDecimal.ZERO);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.findById(300L)).thenReturn(Optional.of(batch));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.INCOME,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("1.00"),
                        null,
                        batch.getId()
                ));

        assertEquals("Inventory batch is not available for sale.", exception.getMessage());
        verify(inventoryMovementRepository, never()).save(any());
        verify(inventoryBatchRepository, never()).save(any());
    }

    @Test
    void shouldRejectSaleWithInsufficientStock() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("1.00"));
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(inventoryBatchRepository.findById(300L)).thenReturn(Optional.of(batch));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.INCOME,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        product.getId(),
                        new BigDecimal("2.00"),
                        null,
                        batch.getId()
                ));

        assertEquals("Inventory batch does not have enough stock.", exception.getMessage());
    }

    @Test
    void shouldThrowWhenProductDoesNotExist() {
        when(productRepository.findById(10L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                service.createFinancialMovement(
                        FinancialTransactionType.EXPENSE,
                        100L,
                        LocalDate.of(2026, 6, 20),
                        200L,
                        10L,
                        new BigDecimal("2.00"),
                        new BigDecimal("10.00"),
                        null
                ));

        assertEquals("Product not found: 10", exception.getMessage());
    }

    @Test
    void shouldCreateProductionInBatchAndMovement() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        when(inventoryBatchRepository.save(any(InventoryBatch.class))).thenAnswer(savedBatchWithId(300L));
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(savedMovementWithId(400L));

        InventoryStockService.StockMovementResult result = service.createProductionIn(
                product,
                "CUT-001",
                LocalDate.of(2026, 6, 20),
                new BigDecimal("8.00"),
                new BigDecimal("12.50")
        );

        ArgumentCaptor<InventoryMovement> movementCaptor = ArgumentCaptor.forClass(InventoryMovement.class);
        verify(inventoryMovementRepository).save(movementCaptor.capture());

        assertEquals(300L, result.batch().getId());
        assertEquals("CUT-001", result.batch().getCode());
        assertEquals(InventoryMovementType.PRODUCTION_IN, movementCaptor.getValue().getMovementType());
        assertEquals(0, new BigDecimal("8.00").compareTo(result.batch().getQuantity()));
    }

    @Test
    void shouldRejectProductionInWhenProductDoesNotControlStock() {
        Product product = product(10L, false, null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createProductionIn(
                        product,
                        "CUT-001",
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("8.00"),
                        new BigDecimal("12.50")
                ));

        assertEquals("Product must control stock to launch a cut.", exception.getMessage());
        verify(inventoryBatchRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void shouldRejectProductionInBeforeStockControlStartDate() {
        Product product = product(10L, true, LocalDate.of(2026, 7, 1));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createProductionIn(
                        product,
                        "CUT-001",
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("8.00"),
                        new BigDecimal("12.50")
                ));

        assertEquals("cutDate cannot be before product stockControlStartDate.", exception.getMessage());
    }

    @Test
    void shouldRejectNegativeUnitCostForProductionIn() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.createProductionIn(
                        product,
                        "CUT-001",
                        LocalDate.of(2026, 6, 20),
                        new BigDecimal("8.00"),
                        new BigDecimal("-0.01")
                ));

        assertEquals("unitCost must be greater than or equal to zero", exception.getMessage());
        verify(inventoryBatchRepository, never()).save(any());
        verify(inventoryMovementRepository, never()).save(any());
    }

    @Test
    void shouldCancelProductionStockWithAdjustmentOut() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("8.00"));
        InventoryMovement productionMovement = InventoryMovement.builder()
                .id(400L)
                .batch(batch)
                .movementType(InventoryMovementType.PRODUCTION_IN)
                .quantity(new BigDecimal("8.00"))
                .unitCost(new BigDecimal("12.50"))
                .movementDate(LocalDate.of(2026, 6, 20))
                .build();
        AdjustmentRootCause rootCause = AdjustmentRootCause.builder()
                .id(500L)
                .name("Cancelamento")
                .build();
        when(inventoryMovementRepository.existsByBatchIdAndIdNot(300L, 400L)).thenReturn(false);
        when(inventoryMovementRepository.save(any(InventoryMovement.class))).thenAnswer(savedMovementWithId(401L));
        when(adjustmentRootCauseRepository.findByName("Cancelamento")).thenReturn(Optional.of(rootCause));
        when(inventoryAdjustmentRepository.save(any(InventoryAdjustment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryBatchRepository.save(any(InventoryBatch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryStockService.StockMovementResult result = service.cancelProductionStock(
                batch,
                productionMovement,
                new BigDecimal("8.00"),
                LocalDate.of(2026, 6, 21),
                "Cancelamento",
                "manual cancellation"
        );

        ArgumentCaptor<InventoryAdjustment> adjustmentCaptor = ArgumentCaptor.forClass(InventoryAdjustment.class);
        verify(inventoryAdjustmentRepository).save(adjustmentCaptor.capture());

        assertEquals(401L, result.movement().getId());
        assertEquals(InventoryMovementType.ADJUSTMENT_OUT, result.movement().getMovementType());
        assertEquals(0, BigDecimal.ZERO.compareTo(batch.getQuantity()));
        assertEquals(InventoryBatchStatus.CANCELED, batch.getStatus());
        assertEquals(InventoryAdjustmentType.NEGATIVE, adjustmentCaptor.getValue().getType());
        assertEquals(rootCause, adjustmentCaptor.getValue().getRootCause());
        assertEquals("manual cancellation", adjustmentCaptor.getValue().getObservation());
        assertEquals(result.movement(), adjustmentCaptor.getValue().getInventoryMovement());
    }

    @Test
    void shouldRejectProductionStockCancellationWhenBatchHasLaterMovements() {
        Product product = product(10L, true, LocalDate.of(2026, 6, 1));
        InventoryBatch batch = batch(product, 300L, InventoryBatchStatus.ACTIVE, new BigDecimal("8.00"));
        InventoryMovement productionMovement = InventoryMovement.builder()
                .id(400L)
                .batch(batch)
                .movementType(InventoryMovementType.PRODUCTION_IN)
                .quantity(new BigDecimal("8.00"))
                .unitCost(new BigDecimal("12.50"))
                .movementDate(LocalDate.of(2026, 6, 20))
                .build();
        when(inventoryMovementRepository.existsByBatchIdAndIdNot(300L, 400L)).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                service.cancelProductionStock(
                        batch,
                        productionMovement,
                        new BigDecimal("8.00"),
                        LocalDate.of(2026, 6, 21),
                        "Cancelamento",
                        "manual cancellation"
                ));

        assertEquals("Cut cannot be canceled because the generated batch has later movements", exception.getMessage());
        verify(inventoryAdjustmentRepository, never()).save(any());
        verify(inventoryBatchRepository, never()).save(any());
    }

    private Product product(Long id, Boolean hasStock, LocalDate stockControlStartDate) {
        return Product.builder()
                .id(id)
                .name("Product " + id)
                .productType(ProductType.RAW_MATERIAL)
                .active(true)
                .hasStock(hasStock)
                .stockControlStartDate(stockControlStartDate)
                .build();
    }

    private InventoryBatch batch(
            Product product,
            Long id,
            InventoryBatchStatus status,
            BigDecimal quantity
    ) {
        return InventoryBatch.builder()
                .id(id)
                .product(product)
                .code("BATCH-" + id)
                .batchDate(LocalDate.of(2026, 6, 1))
                .status(status)
                .unitCost(new BigDecimal("5.25"))
                .quantity(quantity)
                .build();
    }

    private Answer<InventoryBatch> savedBatchWithId(Long id) {
        return invocation -> {
            InventoryBatch batch = invocation.getArgument(0);
            if (batch.getId() == null) {
                batch.setId(id);
            }
            return batch;
        };
    }

    private Answer<InventoryMovement> savedMovementWithId(Long id) {
        return invocation -> {
            InventoryMovement movement = invocation.getArgument(0);
            if (movement.getId() == null) {
                movement.setId(id);
            }
            return movement;
        };
    }
}
