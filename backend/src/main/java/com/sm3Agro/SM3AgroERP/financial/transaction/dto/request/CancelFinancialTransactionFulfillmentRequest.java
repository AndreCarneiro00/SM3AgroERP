package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CancelFinancialTransactionFulfillmentRequest(
        @NotNull
        LocalDate adjustmentDate,
        String observation
) {
}
