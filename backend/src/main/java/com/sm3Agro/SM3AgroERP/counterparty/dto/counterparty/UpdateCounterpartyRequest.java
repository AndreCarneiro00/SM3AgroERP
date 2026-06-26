package com.sm3Agro.SM3AgroERP.counterparty.dto.counterparty;

import com.sm3Agro.SM3AgroERP.counterparty.enums.CounterpartyDocumentType;

public record UpdateCounterpartyRequest(
        Long counterpartyTypeId,
        String legalName,
        String tradeName,
        String city,
        String state,
        String phoneNumber,
        String email,
        String document,
        CounterpartyDocumentType documentType,
        Long segmentId,
        Boolean active
) {
}
