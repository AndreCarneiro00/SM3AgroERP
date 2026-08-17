package com.sm3Agro.SM3AgroERP.production.productionBatch.dto;

import java.math.BigDecimal;

public record ProductionBatchResponse(
        Long id,
        Long inventoryBatchId,
        Long inventoryMovementId,
        BigDecimal quantity,
        String qualityGrade,
        Long cutId,
        String observation
) {
}
