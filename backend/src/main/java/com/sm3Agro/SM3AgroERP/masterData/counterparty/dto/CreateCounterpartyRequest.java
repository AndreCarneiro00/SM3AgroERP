package com.sm3Agro.SM3AgroERP.masterData.counterparty.dto;

import com.sm3Agro.SM3AgroERP.masterData.counterparty.enums.CounterpartyDocumentType;

public record CreateCounterpartyRequest(
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
