package com.sm3Agro.SM3AgroERP.financial.transaction.mapper;

import com.sm3Agro.SM3AgroERP.financial.transaction.domain.FinancialTransactionRules;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionAttachmentResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionDetailResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionFulfillmentAllocationResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionFulfillmentResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionItemResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionSummaryResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionAttachment;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FinancialTransactionResponseMapper {

    private final FinancialTransactionRules rules;
    private final FinancialTransactionFulfillmentAllocationRepository allocationRepository;

    public FinancialTransactionSummaryResponse toSummary(
            FinancialTransaction transaction,
            List<FinancialTransactionItem> items,
            List<FinancialTransactionFulfillment> fulfillments,
            List<FinancialTransactionAttachment> attachments
    ) {
        BigDecimal paidAmount = rules.calculatePaidAmount(fulfillments);
        BigDecimal remainingAmount = rules.calculateRemainingAmount(transaction.getTotalAmount(), paidAmount);

        return new FinancialTransactionSummaryResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getCounterparty() != null ? transaction.getCounterparty().getId() : null,
                transaction.getIssueDate(),
                transaction.getDueDate(),
                transaction.getDocumentNumber(),
                transaction.getStatus(),
                transaction.getType(),
                transaction.getObservation(),
                transaction.getHasNf(),
                transaction.getTotalAmount(),
                paidAmount,
                remainingAmount,
                items.size(),
                attachments.size(),
                fulfillments.size()
        );
    }

    public FinancialTransactionDetailResponse toDetail(
            FinancialTransaction transaction,
            List<FinancialTransactionItem> items,
            List<FinancialTransactionFulfillment> fulfillments,
            List<FinancialTransactionAttachment> attachments
    ) {
        BigDecimal paidAmount = rules.calculatePaidAmount(fulfillments);
        BigDecimal remainingAmount = rules.calculateRemainingAmount(transaction.getTotalAmount(), paidAmount);

        return new FinancialTransactionDetailResponse(
                transaction.getId(),
                transaction.getDescription(),
                transaction.getCounterparty() != null ? transaction.getCounterparty().getId() : null,
                transaction.getIssueDate(),
                transaction.getDueDate(),
                transaction.getDocumentNumber(),
                transaction.getStatus(),
                transaction.getType(),
                transaction.getObservation(),
                transaction.getHasNf(),
                transaction.getTotalAmount(),
                paidAmount,
                remainingAmount,
                items.stream().map(this::toItemResponse).toList(),
                attachments.stream().map(this::toAttachmentResponse).toList(),
                fulfillments.stream().map(this::toFulfillmentResponse).toList()
        );
    }

    public FinancialTransactionItemResponse toItemResponse(FinancialTransactionItem item) {
        return new FinancialTransactionItemResponse(
                item.getId(),
                item.getChartOfAccount().getId(),
                item.getCostCenter() != null ? item.getCostCenter().getId() : null,
                item.getQuantity(),
                item.getUnitPrice(),
                item.getAmount(),
                item.getProduct() != null ? item.getProduct().getId() : null
        );
    }

    public FinancialTransactionFulfillmentResponse toFulfillmentResponse(FinancialTransactionFulfillment fulfillment) {
        return new FinancialTransactionFulfillmentResponse(
                fulfillment.getId(),
                fulfillment.getBankAccount().getId(),
                fulfillment.getPaymentDate(),
                fulfillment.getAmountPaid(),
                fulfillment.getObservation(),
                allocationRepository.findByFulfillmentId(fulfillment.getId()).stream()
                        .map(allocation -> new FinancialTransactionFulfillmentAllocationResponse(
                                allocation.getId(),
                                allocation.getFinancialTransactionItem().getId(),
                                allocation.getAmount()
                        ))
                        .toList()
        );
    }

    public FinancialTransactionAttachmentResponse toAttachmentResponse(FinancialTransactionAttachment attachment) {
        return new FinancialTransactionAttachmentResponse(
                attachment.getId(),
                attachment.getDocumentType().getId(),
                attachment.getFileName(),
                attachment.getDeclaredContentType(),
                attachment.getSizeBytes(),
                attachment.getStorageProvider(),
                attachment.getStoragePath(),
                attachment.getExternalFileId(),
                attachment.getExternalParentId(),
                attachment.getWebUrl(),
                attachment.getChecksumSha256(),
                attachment.getObservation()
        );
    }
}
