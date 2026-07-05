package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public record CreateFinancialTransactionRequest(
        String description,
        Long counterpartyId,
        @NotNull
        LocalDate issueDate,
        LocalDate dueDate,
        String documentNumber,
        @NotNull
        FinancialTransactionType type,
        String observation,
        Boolean hasNf,
        @NotEmpty
        List<@Valid FinancialTransactionItemRequest> items,
        List<@Valid FinancialTransactionAttachmentRequest> attachments,
        List<@Valid FinancialTransactionFulfillmentRequest> fulfillments
) {
}
