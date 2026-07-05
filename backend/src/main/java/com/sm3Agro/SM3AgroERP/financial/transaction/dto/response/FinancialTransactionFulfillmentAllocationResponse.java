package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

import java.math.BigDecimal;

public record FinancialTransactionFulfillmentAllocationResponse(
        Long id,
        Long itemId,
        BigDecimal amount
) {
}
