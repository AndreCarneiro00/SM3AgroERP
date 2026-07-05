package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UpdateFinancialTransactionRequest(
        String description,
        Long counterpartyId,
        @NotNull
        LocalDate issueDate,
        LocalDate dueDate,
        String documentNumber,
        @NotNull
        FinancialTransactionType type,
        String observation,
        Boolean hasNf
) {
}
