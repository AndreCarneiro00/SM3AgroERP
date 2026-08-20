package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import java.time.LocalDate;

public record CancelFinancialTransactionRequest(
        LocalDate adjustmentDate,
        String observation
) {
}
