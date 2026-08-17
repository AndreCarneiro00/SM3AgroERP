package com.sm3Agro.SM3AgroERP.masterData.unitOfMeasure.dto;

import java.math.BigDecimal;

public record UpdateUnitOfMeasureRequest(
        String name,
        Long baseUnitId,
        BigDecimal conversionFactor
) {
}
