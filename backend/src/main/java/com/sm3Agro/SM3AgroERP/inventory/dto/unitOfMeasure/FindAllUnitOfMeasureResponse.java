package com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure;

import java.math.BigDecimal;

public record FindAllUnitOfMeasureResponse(
        Long id,
        String name,
        Long baseUnitId,
        String baseUnitName,
        BigDecimal conversionFactor
) {
}
