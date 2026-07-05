package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialTransactionFulfillmentResult(
        Long id,
        Long bankAccountId,
        LocalDate paymentDate,
        BigDecimal amountPaid,
        String observation,
        List<FinancialTransactionFulfillmentAllocationResult> allocations
) {
}
