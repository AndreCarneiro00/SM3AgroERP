package com.sm3Agro.SM3AgroERP.masterData.field.dto;

import java.math.BigDecimal;

public record UpdateFieldRequest(
        String name,
        BigDecimal areaHectares
) {
}
