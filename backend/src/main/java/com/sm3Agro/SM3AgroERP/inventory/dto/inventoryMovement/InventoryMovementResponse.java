package com.sm3Agro.SM3AgroERP.inventory.dto.inventoryMovement;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryMovementType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryMovementResponse(
        Long id,
        Long batchId,
        InventoryMovementType movementType,
        BigDecimal quantity,
        BigDecimal unitCost,
        LocalDate movementDate,
        Long financialTransactionItemId
) {
}
