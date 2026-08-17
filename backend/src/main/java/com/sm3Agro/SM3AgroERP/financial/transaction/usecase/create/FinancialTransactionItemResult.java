package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryMovementType;

import java.math.BigDecimal;

public record FinancialTransactionItemResult(
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

    public FinancialTransactionItemResult(
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

    public FinancialTransactionItemResult withStockMovement(
            Long inventoryMovementId,
            Long inventoryBatchId,
            InventoryMovementType stockMovementType
    ) {
        return new FinancialTransactionItemResult(
                id,
                chartOfAccountId,
                costCenterId,
                quantity,
                unitPrice,
                amount,
                productId,
                inventoryMovementId,
                inventoryBatchId,
                stockMovementType
        );
    }
}
