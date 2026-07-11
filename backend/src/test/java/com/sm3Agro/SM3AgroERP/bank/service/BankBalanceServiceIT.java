package com.sm3Agro.SM3AgroERP.bank.service;

import com.sm3Agro.SM3AgroERP.bank.entity.BankAccount;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
class BankBalanceServiceIT extends AbstractFinancialTransactionIT {

    @Autowired
    private BankBalanceService bankBalanceService;

    @Autowired
    private BankTransferRepository bankTransferRepository;

    @Test
    void shouldCalculateBalanceFromInitialBalanceFulfillmentsAndTransfers() {
        BankAccount mainAccount = bankAccountRepository.save(BankAccount.builder()
                .name("Conta Principal")
                .active(true)
                .initialBalance(new BigDecimal("100.00"))
                .initialBalanceDate(LocalDate.of(2026, 7, 1))
                .build());
        BankAccount reserveAccount = bankAccountRepository.save(BankAccount.builder()
                .name("Conta Reserva")
                .active(true)
                .initialBalance(new BigDecimal("50.00"))
                .initialBalanceDate(LocalDate.of(2026, 7, 1))
                .build());

        FinancialTransaction incomeTransaction = financialTransactionRepository.save(FinancialTransaction.builder()
                .description("Recebimento")
                .issueDate(LocalDate.of(2026, 7, 2))
                .status(FinancialTransactionStatus.PAID)
                .type(FinancialTransactionType.INCOME)
                .totalAmount(new BigDecimal("40.00"))
                .build());
        FinancialTransaction expenseTransaction = financialTransactionRepository.save(FinancialTransaction.builder()
                .description("Pagamento")
                .issueDate(LocalDate.of(2026, 7, 3))
                .status(FinancialTransactionStatus.PAID)
                .type(FinancialTransactionType.EXPENSE)
                .totalAmount(new BigDecimal("30.00"))
                .build());

        financialTransactionFulfillmentRepository.save(FinancialTransactionFulfillment.builder()
                .financialTransaction(incomeTransaction)
                .bankAccount(mainAccount)
                .paymentDate(LocalDate.of(2026, 7, 2))
                .amountPaid(new BigDecimal("40.00"))
                .observation("Receita liquidada")
                .build());
        financialTransactionFulfillmentRepository.save(FinancialTransactionFulfillment.builder()
                .financialTransaction(expenseTransaction)
                .bankAccount(mainAccount)
                .paymentDate(LocalDate.of(2026, 7, 3))
                .amountPaid(new BigDecimal("30.00"))
                .observation("Despesa liquidada")
                .build());

        bankTransferRepository.save(BankTransfer.builder()
                .sourceBankAccount(mainAccount)
                .destinationBankAccount(reserveAccount)
                .amount(new BigDecimal("20.00"))
                .transferDate(LocalDate.of(2026, 7, 4))
                .observation("Reserva")
                .build());
        bankTransferRepository.save(BankTransfer.builder()
                .sourceBankAccount(reserveAccount)
                .destinationBankAccount(mainAccount)
                .amount(new BigDecimal("10.00"))
                .transferDate(LocalDate.of(2026, 7, 5))
                .observation("Retorno")
                .build());

        BigDecimal balanceAtDate = bankBalanceService.calculateBalanceAtDate(
                mainAccount,
                LocalDate.of(2026, 7, 5)
        );

        assertEquals(0, balanceAtDate.compareTo(new BigDecimal("100.00")));
    }
}
