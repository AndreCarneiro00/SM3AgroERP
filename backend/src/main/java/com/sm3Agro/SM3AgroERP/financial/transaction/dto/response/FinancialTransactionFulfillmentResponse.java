package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialTransactionFulfillmentResponse(
        Long id,
        Long bankAccountId,
        LocalDate paymentDate,
        BigDecimal amountPaid,
        String observation,
        CashMovementStatus status,
        Long cancelId,
        List<FinancialTransactionFulfillmentAllocationResponse> allocations
) {
}
