package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

import com.sm3Agro.SM3AgroERP.inventory.movement.enums.InventoryMovementType;

import java.math.BigDecimal;

public record FinancialTransactionItemResponse(
        Long id,
        Long chartOfAccountId,
        Long costCenterId,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal amount,
        Long productId,
        Long inventoryMovementId,
        Long inventoryBatchId,
        InventoryMovementType stockMovementType
) {

    public FinancialTransactionItemResponse(
            Long id,
            Long chartOfAccountId,
            Long costCenterId,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal amount,
            Long productId
    ) {
        this(id, chartOfAccountId, costCenterId, quantity, unitPrice, amount, productId, null, null, null);
    }
}
