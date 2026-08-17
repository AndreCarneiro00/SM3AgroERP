package com.sm3Agro.SM3AgroERP.masterData.counterpartyType.dto;

public record UpdateCounterpartyTypeRequest(
        String name,
        String description,
        Boolean active
) {
}
