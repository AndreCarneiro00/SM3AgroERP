package com.sm3Agro.SM3AgroERP.production.cut.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LaunchCutRequest(
        Long fieldId,
        Long productId,
        LocalDate cutDate,
        BigDecimal quantity,
        BigDecimal unitCost,
        String qualityGrade,
        String observation
) {
}
