package com.sm3Agro.SM3AgroERP.inventory.dto.unitOfMeasure;

import java.math.BigDecimal;

public record CreateUnitOfMeasureRequest(
        String name,
        Long baseUnitId,
        BigDecimal conversionFactor
) {
}
