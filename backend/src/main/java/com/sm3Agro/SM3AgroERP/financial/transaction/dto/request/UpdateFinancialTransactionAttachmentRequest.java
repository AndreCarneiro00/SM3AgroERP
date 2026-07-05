package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.constraints.NotNull;

public record UpdateFinancialTransactionAttachmentRequest(
        @NotNull
        Long documentTypeId,
        String observation
) {
}
