package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record FinancialTransactionItemRequest(
        @NotNull
        Long chartOfAccountId,
        Long costCenterId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        @NotNull
        BigDecimal amount,
        Long productId
) {
}
