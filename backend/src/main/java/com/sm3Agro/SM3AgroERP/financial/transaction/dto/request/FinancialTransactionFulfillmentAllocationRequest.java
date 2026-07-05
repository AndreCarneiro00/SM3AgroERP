package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record FinancialTransactionFulfillmentAllocationRequest(
        Long itemId,
        @Min(0)
        Integer itemIndex,
        @NotNull
        @Positive
        BigDecimal amount
) {
}
