package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import java.math.BigDecimal;

public record FinancialTransactionItemResult(
        Long id,
        Long chartOfAccountId,
        Long costCenterId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount,
        Long productId
) {
}
