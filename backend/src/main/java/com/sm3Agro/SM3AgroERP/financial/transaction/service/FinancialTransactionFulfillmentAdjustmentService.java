package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.balance.BankBalanceService;
import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FinancialTransactionFulfillmentAdjustmentService {

    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final BankBalanceService bankBalanceService;

    public FinancialTransactionFulfillment cancel(
            FinancialTransactionFulfillment originalFulfillment,
            LocalDate adjustmentDate,
            String observation
    ) {
        if (originalFulfillment.getStatus() != CashMovementStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active fulfillments can be canceled.");
        }

        bankBalanceService.validateFulfillmentAdjustment(originalFulfillment, adjustmentDate);

        FinancialTransactionFulfillment adjustment = FinancialTransactionFulfillment.builder()
                .financialTransaction(originalFulfillment.getFinancialTransaction())
                .bankAccount(originalFulfillment.getBankAccount())
                .paymentDate(adjustmentDate)
                .amountPaid(originalFulfillment.getAmountPaid())
                .observation(observation)
                .status(CashMovementStatus.ADJUSTMENT)
                .cancelFulfillment(originalFulfillment)
                .build();

        originalFulfillment.setStatus(CashMovementStatus.CANCELED);
        fulfillmentRepository.save(originalFulfillment);
        return fulfillmentRepository.save(adjustment);
    }
}
