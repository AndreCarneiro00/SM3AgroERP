package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

import java.math.BigDecimal;

public record FinancialTransactionItemResponse(
        Long id,
        Long chartOfAccountId,
        Long costCenterId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount,
        Long productId
) {
}
