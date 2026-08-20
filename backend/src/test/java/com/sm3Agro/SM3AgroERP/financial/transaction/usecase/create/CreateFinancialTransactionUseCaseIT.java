package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.CreateFinancialTransactionResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.batch.enums.InventoryBatchStatus;
import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class CreateFinancialTransactionUseCaseIT extends AbstractFinancialTransactionIT {

    @Autowired
    private CreateFinancialTransactionUseCase useCase;

    @Test
    void shouldCreateCompleteAggregate() {
        CreateFinancialTransactionRequest request = createValidRequest();
        var files = createAttachmentFiles();

        CreateFinancialTransactionResult result = useCase.execute(request, files);

        assertEquals(1, financialTransactionRepository.count());
        assertEquals(1, financialTransactionItemRepository.count());
        assertEquals(1, financialTransactionAttachmentRepository.count());
        assertEquals(1, financialTransactionFulfillmentRepository.count());
        assertEquals(1, financialTransactionFulfillmentAllocationRepository.count());
        assertEquals(1, result.items().size());
        assertEquals(1, result.attachments().size());
        assertEquals(1, result.fulfillments().size());
        assertEquals(new BigDecimal("100.00"), result.totalAmount());
    }

    @Test
    void shouldCreateManualFulfillmentAllocationsByItemIndex() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        FinancialTransactionItemRequest firstItem = valid.items().getFirst();
        FinancialTransactionItemRequest secondItem = new FinancialTransactionItemRequest(
                firstItem.chartOfAccountId(),
                firstItem.costCenterId(),
                BigDecimal.ONE,
                new BigDecimal("60.00"),
                new BigDecimal("60.00"),
                firstItem.productId()
        );
        CreateFinancialTransactionRequest request = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                List.of(firstItem, secondItem),
                valid.attachments(),
                List.of(new FinancialTransactionFulfillmentRequest(
                        valid.fulfillments().getFirst().bankAccountId(),
                        valid.fulfillments().getFirst().paymentDate(),
                        new BigDecimal("160.00"),
                        "manual split",
                        List.of(
                                new FinancialTransactionFulfillmentAllocationRequest(
                                        null,
                                        0,
                                        new BigDecimal("100.00")
                                ),
                                new FinancialTransactionFulfillmentAllocationRequest(
                                        null,
                                        1,
                                        new BigDecimal("60.00")
                                )
                        )
                ))
        );

        CreateFinancialTransactionResult result = useCase.execute(request, createAttachmentFiles());

        assertEquals(2, result.items().size());
        assertEquals(1, result.fulfillments().size());
        assertEquals(2, result.fulfillments().getFirst().allocations().size());
        assertEquals(2, financialTransactionFulfillmentAllocationRepository.count());
        assertEquals(new BigDecimal("160.00"), result.totalAmount());
    }

    @Test
    void shouldCreatePurchaseInventoryForStockControlledProduct() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createStockControlledProduct(LocalDate.of(2026, 6, 1));
        CreateFinancialTransactionRequest request = withSingleItem(
                valid,
                FinancialTransactionType.EXPENSE,
                product.getId(),
                null,
                null,
                new BigDecimal("2.00")
        );

        CreateFinancialTransactionResult result = useCase.execute(request, createAttachmentFiles());

        assertEquals(1, inventoryBatchRepository.count());
        assertEquals(1, inventoryMovementRepository.count());
        var movement = inventoryMovementRepository.findAll().getFirst();
        var batch = movement.getBatch();
        assertEquals(InventoryMovementType.PURCHASE_IN, movement.getMovementType());
        assertEquals(result.items().getFirst().id(), movement.getFinancialTransactionItemId());
        assertEquals(0, new BigDecimal("50.00").compareTo(movement.getUnitCost()));
        assertEquals(0, new BigDecimal("2.00").compareTo(batch.getQuantity()));
        assertEquals(result.items().getFirst().inventoryMovementId(), movement.getId());
        assertEquals(result.items().getFirst().inventoryBatchId(), batch.getId());
    }

    @Test
    void shouldSkipInventoryWhenIssueDateIsBeforeStockControlStartDate() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createStockControlledProduct(LocalDate.of(2026, 7, 1));
        CreateFinancialTransactionRequest request = withSingleItem(
                valid,
                FinancialTransactionType.EXPENSE,
                product.getId(),
                null,
                new BigDecimal("42.50"),
                new BigDecimal("2.00")
        );

        CreateFinancialTransactionResult result = useCase.execute(request, createAttachmentFiles());

        assertEquals(0, inventoryBatchRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(1, result.items().size());
        assertEquals(null, result.items().getFirst().inventoryMovementId());
    }

    @Test
    void shouldCreateSaleInventoryMovementAndDecreaseBatchQuantity() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createStockControlledProduct(LocalDate.of(2026, 6, 1));
        InventoryBatch batch = inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code("OPEN-1")
                .batchDate(LocalDate.of(2026, 6, 1))
                .status(InventoryBatchStatus.ACTIVE)
                .unitCost(new BigDecimal("20.00"))
                .quantity(new BigDecimal("5.00"))
                .build());
        CreateFinancialTransactionRequest request = withSingleItem(
                valid,
                FinancialTransactionType.INCOME,
                product.getId(),
                batch.getId(),
                null,
                new BigDecimal("2.00")
        );

        CreateFinancialTransactionResult result = useCase.execute(request, createAttachmentFiles());

        var movement = inventoryMovementRepository.findAll().getFirst();
        var updatedBatch = inventoryBatchRepository.findById(batch.getId()).orElseThrow();
        assertEquals(InventoryMovementType.SALE_OUT, movement.getMovementType());
        assertEquals(0, new BigDecimal("20.00").compareTo(movement.getUnitCost()));
        assertEquals(0, new BigDecimal("3.00").compareTo(updatedBatch.getQuantity()));
        assertEquals(InventoryBatchStatus.ACTIVE, updatedBatch.getStatus());
        assertEquals(result.items().getFirst().inventoryBatchId(), batch.getId());
    }

    @Test
    void shouldRollbackFinancialTransactionWhenStockFails() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createStockControlledProduct(LocalDate.of(2026, 6, 1));
        InventoryBatch batch = inventoryBatchRepository.save(InventoryBatch.builder()
                .product(product)
                .code("OPEN-1")
                .batchDate(LocalDate.of(2026, 6, 1))
                .status(InventoryBatchStatus.ACTIVE)
                .unitCost(new BigDecimal("20.00"))
                .quantity(new BigDecimal("1.00"))
                .build());
        CreateFinancialTransactionRequest request = withSingleItem(
                valid,
                FinancialTransactionType.INCOME,
                product.getId(),
                batch.getId(),
                null,
                new BigDecimal("2.00")
        );

        assertThrows(IllegalArgumentException.class, () -> useCase.execute(request, createAttachmentFiles()));
        assertEquals(0, financialTransactionRepository.count());
        assertEquals(0, financialTransactionItemRepository.count());
        assertEquals(0, inventoryMovementRepository.count());
        assertEquals(
                0,
                new BigDecimal("1.00").compareTo(
                        inventoryBatchRepository.findById(batch.getId()).orElseThrow().getQuantity()
                )
        );
    }

    @Test
    void shouldRejectUnclassifiedProductInFinancialTransaction() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        Product product = createProduct();
        product.setHasStock(null);
        productRepository.save(product);
        CreateFinancialTransactionRequest request = withSingleItem(
                valid,
                FinancialTransactionType.EXPENSE,
                product.getId(),
                null,
                new BigDecimal("42.50"),
                new BigDecimal("2.00")
        );

        assertThrows(IllegalArgumentException.class, () -> useCase.execute(request, createAttachmentFiles()));
        assertEquals(0, financialTransactionRepository.count());
        assertEquals(0, financialTransactionItemRepository.count());
    }

    @Test
    void shouldRollbackEverythingWhenItemCreationFails() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        var files = createAttachmentFiles();
        CreateFinancialTransactionRequest invalid = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                java.util.List.of(new com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest(
                        99999L,
                        valid.items().getFirst().costCenterId(),
                        valid.items().getFirst().quantity(),
                        valid.items().getFirst().unitPrice(),
                        valid.items().getFirst().amount(),
                        valid.items().getFirst().productId()
                )),
                valid.attachments(),
                valid.fulfillments()
        );

        assertThrows(RuntimeException.class, () -> useCase.execute(invalid, files));
        assertEquals(0, financialTransactionRepository.count());
        assertEquals(0, financialTransactionItemRepository.count());
        assertEquals(0, financialTransactionAttachmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentAllocationRepository.count());
    }

    @Test
    void shouldRollbackEverythingWhenAttachmentCreationFails() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        var files = createAttachmentFiles();
        CreateFinancialTransactionRequest invalid = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                valid.items(),
                java.util.List.of(new com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionAttachmentRequest(
                        99999L,
                        0,
                        "obs"
                )),
                valid.fulfillments()
        );

        assertThrows(RuntimeException.class, () -> useCase.execute(invalid, files));
        assertEquals(0, financialTransactionRepository.count());
        assertEquals(0, financialTransactionItemRepository.count());
        assertEquals(0, financialTransactionAttachmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentAllocationRepository.count());
    }

    @Test
    void shouldRollbackEverythingWhenFulfillmentCreationFails() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        var files = createAttachmentFiles();
        CreateFinancialTransactionRequest invalid = new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                valid.type(),
                valid.observation(),
                valid.hasNf(),
                valid.items(),
                valid.attachments(),
                java.util.List.of(new com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest(
                        99999L,
                        valid.fulfillments().getFirst().paymentDate(),
                        valid.fulfillments().getFirst().amountPaid(),
                        valid.fulfillments().getFirst().observation(),
                        valid.fulfillments().getFirst().allocations()
                ))
        );

        assertThrows(RuntimeException.class, () -> useCase.execute(invalid, files));
        assertEquals(0, financialTransactionRepository.count());
        assertEquals(0, financialTransactionItemRepository.count());
        assertEquals(0, financialTransactionAttachmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentRepository.count());
        assertEquals(0, financialTransactionFulfillmentAllocationRepository.count());
    }

    private CreateFinancialTransactionRequest withSingleItem(
            CreateFinancialTransactionRequest valid,
            FinancialTransactionType type,
            Long productId,
            Long inventoryBatchId,
            BigDecimal inventoryUnitCost,
            BigDecimal quantity
    ) {
        FinancialTransactionItemRequest validItem = valid.items().getFirst();
        return new CreateFinancialTransactionRequest(
                valid.description(),
                valid.counterpartyId(),
                valid.issueDate(),
                valid.dueDate(),
                valid.documentNumber(),
                type,
                valid.observation(),
                valid.hasNf(),
                List.of(new FinancialTransactionItemRequest(
                        validItem.chartOfAccountId(),
                        validItem.costCenterId(),
                        quantity,
                        validItem.unitPrice(),
                        quantity.multiply(validItem.unitPrice()),
                        productId,
                        inventoryBatchId,
                        inventoryUnitCost
                )),
                valid.attachments(),
                valid.fulfillments()
        );
    }
}

