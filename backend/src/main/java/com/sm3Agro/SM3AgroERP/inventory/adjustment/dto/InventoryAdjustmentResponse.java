package com.sm3Agro.SM3AgroERP.inventory.adjustment.dto;

import com.sm3Agro.SM3AgroERP.inventory.adjustment.enums.InventoryAdjustmentType;

public record InventoryAdjustmentResponse(
        Long id,
        InventoryAdjustmentType type,
        Long rootCauseId,
        String observation,
        Long inventoryMovementId
) {
}
