package com.sm3Agro.SM3AgroERP.financial.transaction.domain;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class FinancialTransactionRules {

    public BigDecimal calculateTotalAmount(List<FinancialTransactionItem> items) {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(item -> item.getAmount() == null ? BigDecimal.ZERO : item.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculatePaidAmount(List<FinancialTransactionFulfillment> fulfillments) {
        if (fulfillments == null || fulfillments.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return fulfillments.stream()
                .map(fulfillment -> fulfillment.getAmountPaid() == null ? BigDecimal.ZERO : fulfillment.getAmountPaid())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateRemainingAmount(BigDecimal totalAmount, BigDecimal paidAmount) {
        BigDecimal remainingAmount = normalize(totalAmount).subtract(normalize(paidAmount));
        return remainingAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remainingAmount;
    }

    public FinancialTransactionStatus resolveStatus(BigDecimal totalAmount, BigDecimal paidAmount) {
        requirePaymentNotOverTotal(totalAmount, paidAmount);

        if (normalize(paidAmount).compareTo(BigDecimal.ZERO) <= 0) {
            return FinancialTransactionStatus.PENDING;
        }

        if (normalize(paidAmount).compareTo(normalize(totalAmount)) >= 0) {
            return FinancialTransactionStatus.PAID;
        }

        return FinancialTransactionStatus.PARTIAL;
    }

    public void requireMutable(FinancialTransaction transaction) {
        if (transaction.getStatus() == FinancialTransactionStatus.CANCELED) {
            throw new IllegalArgumentException("Canceled financial transactions cannot be changed.");
        }
    }

    public void requirePaymentNotOverTotal(BigDecimal totalAmount, BigDecimal paidAmount) {
        if (normalize(paidAmount).compareTo(normalize(totalAmount)) > 0) {
            throw new IllegalArgumentException("Paid amount cannot exceed transaction total amount.");
        }
    }

    public void requireAllocationMatchesPayment(BigDecimal amountPaid, BigDecimal allocatedAmount) {
        if (normalize(amountPaid).compareTo(normalize(allocatedAmount)) != 0) {
            throw new IllegalArgumentException("Fulfillment allocations must match the paid amount.");
        }
    }

    public void requireItemAllocationNotOverAmount(BigDecimal itemAmount, BigDecimal allocatedAmount) {
        if (normalize(allocatedAmount).compareTo(normalize(itemAmount)) > 0) {
            throw new IllegalArgumentException("Allocated amount cannot exceed financial transaction item amount.");
        }
    }

    private BigDecimal normalize(BigDecimal value) {
        return (value == null ? BigDecimal.ZERO : value).setScale(2, RoundingMode.HALF_UP);
    }
}
