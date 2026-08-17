package com.sm3Agro.SM3AgroERP.masterData.field.dto;

import java.math.BigDecimal;

public record FindAllFieldResponse(
        Long id,
        String name,
        BigDecimal areaHectares
) {
}
