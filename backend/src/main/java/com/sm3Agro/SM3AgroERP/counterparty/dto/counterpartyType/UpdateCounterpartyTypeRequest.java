package com.sm3Agro.SM3AgroERP.counterparty.dto.counterpartyType;

public record UpdateCounterpartyTypeRequest(
        String name,
        String description,
        Boolean active
) {
}
