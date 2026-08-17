package com.sm3Agro.SM3AgroERP.inventory.dto.inventoryBatch;

import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryBatchStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record InventoryBatchResponse(
        Long id,
        Long productId,
        String code,
        LocalDate batchDate,
        InventoryBatchStatus status,
        BigDecimal unitCost,
        BigDecimal quantity
) {
}
