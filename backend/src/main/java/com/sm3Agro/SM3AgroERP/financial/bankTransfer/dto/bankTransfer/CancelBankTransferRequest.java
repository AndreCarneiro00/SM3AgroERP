package com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CancelBankTransferRequest(
        @NotNull
        LocalDate adjustmentDate,
        String observation
) {
}
