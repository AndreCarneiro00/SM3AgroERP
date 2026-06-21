package com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType;

public record FindAllCounterpartyTypeResponse(
        Long id,
        String name,
        String description,
        Boolean active
) {
}
