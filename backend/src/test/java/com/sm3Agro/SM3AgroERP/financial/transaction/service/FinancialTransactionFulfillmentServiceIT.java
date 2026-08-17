package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionFulfillmentAllocationRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
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
class FinancialTransactionFulfillmentServiceIT extends AbstractFinancialTransactionIT {

    @Autowired
    private FinancialTransactionFulfillmentService fulfillmentService;

    @Test
    void shouldPersistFulfillmentsWithBankAccount() {
        FinancialTransaction transaction = createPersistedTransaction();
        var item = createPersistedTransactionItem(transaction);
        var bankAccount = createBankAccount();

        var result = fulfillmentService.createAll(transaction, List.of(
                new FinancialTransactionFulfillmentRequest(
                        bankAccount.getId(),
                        LocalDate.of(2026, 6, 29),
                        new BigDecimal("100.00"),
                        "paid",
                        List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                item.getId(),
                                null,
                                new BigDecimal("100.00")
                        ))
                )
        ));

        assertEquals(1, result.size());
        assertEquals(1, financialTransactionFulfillmentRepository.count());
        assertEquals(bankAccount.getId(), result.getFirst().bankAccountId());
    }

    @Test
    void shouldThrowWhenBankAccountDoesNotExist() {
        FinancialTransaction transaction = createPersistedTransaction();
        var item = createPersistedTransactionItem(transaction);

        assertThrows(RuntimeException.class, () -> fulfillmentService.createAll(transaction, List.of(
                new FinancialTransactionFulfillmentRequest(
                        99999L,
                        LocalDate.of(2026, 6, 29),
                        new BigDecimal("100.00"),
                        "paid",
                        List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                item.getId(),
                                null,
                                new BigDecimal("100.00")
                        ))
                )
        )));
    }

    @Test
    void shouldRejectExpenseFulfillmentWhenBankBalanceWouldBecomeNegative() {
        FinancialTransaction transaction = createPersistedTransaction();
        var item = createPersistedTransactionItem(transaction);
        var bankAccount = createBankAccount();

        bankAccount.setInitialBalance(new BigDecimal("50.00"));
        bankAccount.setInitialBalanceDate(LocalDate.of(2026, 6, 1));
        bankAccount = bankAccountRepository.save(bankAccount);
        Long bankAccountId = bankAccount.getId();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                fulfillmentService.createAll(transaction, List.of(
                        new FinancialTransactionFulfillmentRequest(
                                bankAccountId,
                                LocalDate.of(2026, 6, 29),
                                new BigDecimal("100.00"),
                                "paid",
                                List.of(new FinancialTransactionFulfillmentAllocationRequest(
                                        item.getId(),
                                        null,
                                        new BigDecimal("100.00")
                                ))
                        )
                ))
        );

        assertEquals(
                "Expense fulfillment would make bank account 'Main Account' negative on 2026-06-29.",
                exception.getMessage()
        );
    }
}

