package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.CreateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class FinancialTransactionServiceIT extends AbstractFinancialTransactionIT {

    @Autowired
    private FinancialTransactionService financialTransactionService;

    @Test
    void shouldCalculateTotalAndSetPendingStatus() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        CreateFinancialTransactionRequest request = new CreateFinancialTransactionRequest(
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
                List.of()
        );

        var transaction = financialTransactionService.create(request);

        assertEquals(new BigDecimal("100.00"), transaction.getTotalAmount());
        assertEquals(FinancialTransactionStatus.PENDING, transaction.getStatus());
    }

    @Test
    void shouldSetPartialStatusForPartialPayment() {
        CreateFinancialTransactionRequest valid = createValidRequest();
        CreateFinancialTransactionRequest request = new CreateFinancialTransactionRequest(
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
                List.of(new FinancialTransactionFulfillmentRequest(
                        valid.fulfillments().getFirst().bankAccountId(),
                        valid.fulfillments().getFirst().paymentDate(),
                        new BigDecimal("40.00"),
                        "partial",
                        List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                null,
                                0,
                                new BigDecimal("40.00")
                        ))
                ))
        );

        var transaction = financialTransactionService.create(request);

        assertEquals(FinancialTransactionStatus.PARTIAL, transaction.getStatus());
    }

    @Test
    void shouldRejectChangingTransactionTypeAfterCreation() {
        FinancialTransaction transaction = createPersistedTransaction();

        UpdateFinancialTransactionRequest request = new UpdateFinancialTransactionRequest(
                transaction.getDescription(),
                transaction.getCounterparty().getId(),
                transaction.getIssueDate(),
                transaction.getDueDate(),
                transaction.getDocumentNumber(),
                FinancialTransactionType.INCOME,
                transaction.getObservation(),
                transaction.getHasNf()
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> financialTransactionService.update(transaction.getId(), request)
        );

        assertEquals("Financial transaction type cannot be changed after creation.", exception.getMessage());
        assertEquals(
                FinancialTransactionType.EXPENSE,
                financialTransactionRepository.findById(transaction.getId()).orElseThrow().getType()
        );
    }

    @Test
    void shouldRejectChangingIssueDateAfterCreation() {
        FinancialTransaction transaction = createPersistedTransaction();

        UpdateFinancialTransactionRequest request = new UpdateFinancialTransactionRequest(
                transaction.getDescription(),
                transaction.getCounterparty().getId(),
                LocalDate.of(2026, 7, 1),
                transaction.getDueDate(),
                transaction.getDocumentNumber(),
                transaction.getType(),
                transaction.getObservation(),
                transaction.getHasNf()
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> financialTransactionService.update(transaction.getId(), request)
        );

        assertEquals("Financial transaction issue date cannot be changed after creation.", exception.getMessage());
        assertEquals(
                LocalDate.of(2026, 6, 29),
                financialTransactionRepository.findById(transaction.getId()).orElseThrow().getIssueDate()
        );
    }
}

