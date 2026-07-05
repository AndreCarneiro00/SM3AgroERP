package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import java.math.BigDecimal;

public record FinancialTransactionFulfillmentAllocationResult(
        Long id,
        Long itemId,
        BigDecimal amount
) {
}
