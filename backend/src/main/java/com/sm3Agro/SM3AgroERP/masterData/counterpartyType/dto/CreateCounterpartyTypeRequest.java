package com.sm3Agro.SM3AgroERP.masterData.counterpartyType.dto;

public record CreateCounterpartyTypeRequest(
        String name,
        String description,
        Boolean active
) {
}
