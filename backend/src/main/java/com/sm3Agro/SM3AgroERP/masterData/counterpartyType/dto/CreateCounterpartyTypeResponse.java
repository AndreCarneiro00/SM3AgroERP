package com.sm3Agro.SM3AgroERP.masterData.counterpartyType.dto;

public record CreateCounterpartyTypeResponse(
        Long id,
        String name,
        String description,
        Boolean active
) {
}
