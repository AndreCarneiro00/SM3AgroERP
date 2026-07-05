package com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create;

import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record CreateFinancialTransactionResult(
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
        List<FinancialTransactionItemResult> items,
        List<FinancialTransactionAttachmentResult> attachments,
        List<FinancialTransactionFulfillmentResult> fulfillments
) {
}
