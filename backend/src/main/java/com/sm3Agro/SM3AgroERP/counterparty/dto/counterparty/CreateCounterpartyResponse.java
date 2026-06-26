package com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty;

import com.sm3Agro.SM3AgroERP.counterparty.enums.CounterpartyDocumentType;

public record CreateCounterpartyResponse(
        Long id,
        Long counterpartyTypeId,
        String counterpartyTypeName,
        String legalName,
        String tradeName,
        String city,
        String state,
        String phoneNumber,
        String email,
        String document,
        CounterpartyDocumentType documentType,
        Long segmentId,
        String segmentName,
        Boolean active
) {
}
