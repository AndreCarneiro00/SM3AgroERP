package com.sm3Agro.SM3AgroERP.production.dto.field;

import java.math.BigDecimal;

public record UpdateFieldResponse(
        Long id,
        String name,
        BigDecimal areaHectares
) {
}
