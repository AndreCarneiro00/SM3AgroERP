package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.CreateFinancialTransactionResult;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
}
