package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FinancialTransactionAttachmentRequest(
        @NotNull
        Long documentTypeId,
        @NotNull
        @Min(0)
        Integer fileIndex,
        String observation
) {
}
