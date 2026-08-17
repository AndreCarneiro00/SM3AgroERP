package com.sm3Agro.SM3AgroERP.production.cut.dto;

import com.sm3Agro.SM3AgroERP.production.cut.enums.CutStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CutResponse(
        Long id,
        Long fieldId,
        Long productId,
        Long productFamilyId,
        Long inventoryBatchId,
        Long inventoryMovementId,
        Long productionBatchId,
        String batchCode,
        LocalDate cutDate,
        Integer cutNumber,
        CutStatus status,
        BigDecimal quantity,
        BigDecimal unitCost,
        String qualityGrade,
        String observation,
        Integer daysSinceLastCut
) {
}
