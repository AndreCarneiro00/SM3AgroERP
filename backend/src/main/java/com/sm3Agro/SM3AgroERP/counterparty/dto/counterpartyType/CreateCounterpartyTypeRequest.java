package com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType;

public record CreateCounterpartyTypeRequest(
        String name,
        String description,
        Boolean active
) {
}
