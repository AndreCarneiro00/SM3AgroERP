package com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateBankTransferRequest(
        @NotNull
        Long sourceBankAccountId,
        @NotNull
        Long destinationBankAccountId,
        @NotNull
        @Positive
        BigDecimal amount,
        @NotNull
        LocalDate transferDate,
        String observation
) {
}
