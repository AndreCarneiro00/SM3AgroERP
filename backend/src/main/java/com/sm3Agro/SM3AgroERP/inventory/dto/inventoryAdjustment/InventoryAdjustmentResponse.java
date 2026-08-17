package com.sm3Agro.SM3AgroERP.inventory.dto.inventoryAdjustment;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryAdjustmentType;

public record InventoryAdjustmentResponse(
        Long id,
        InventoryAdjustmentType type,
        Long rootCauseId,
        String observation,
        Long inventoryMovementId
) {
}
