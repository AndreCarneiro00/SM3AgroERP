package com.sm3Agro.SM3AgroERP.financial.transaction.dto.response;

import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateFinancialTransactionResponse(
        Long id,
        String description,
        Long counterpartyId,
        LocalDate issueDate,
        LocalDate dueDate,
        String documentNumber,
        FinancialTransactionStatus status,
        FinancialTransactionType type,
        String observation,
        Boolean hasNf,
        BigDecimal totalAmount,
        List<FinancialTransactionItemResponse> items,
        List<FinancialTransactionAttachmentResponse> attachments,
        List<FinancialTransactionFulfillmentResponse> fulfillments
) {
}
