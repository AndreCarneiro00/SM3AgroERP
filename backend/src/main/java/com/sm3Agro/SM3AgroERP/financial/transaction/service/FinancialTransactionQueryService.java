package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionDetailResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.response.FinancialTransactionSummaryResponse;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.mapper.FinancialTransactionResponseMapper;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionAttachmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FinancialTransactionQueryService {

    private final FinancialTransactionService transactionService;
    private final FinancialTransactionItemRepository itemRepository;
    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final FinancialTransactionAttachmentRepository attachmentRepository;
    private final FinancialTransactionResponseMapper mapper;

    @Transactional(readOnly = true)
    public List<FinancialTransactionSummaryResponse> findAll() {
        return findAll(null, null);
    }

    @Transactional(readOnly = true)
    public List<FinancialTransactionSummaryResponse> findAll(LocalDate startDate, LocalDate endDate) {
        return transactionService.findAll(startDate, endDate).stream()
                .map(transaction -> mapper.toSummary(
                        transaction,
                        itemRepository.findByFinancialTransactionId(transaction.getId()),
                        fulfillmentRepository.findByFinancialTransactionId(transaction.getId()),
                        attachmentRepository.findByFinancialTransactionId(transaction.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public FinancialTransactionDetailResponse findById(Long id) {
        FinancialTransaction transaction = transactionService.findById(id);

        return mapper.toDetail(
                transaction,
                itemRepository.findByFinancialTransactionId(id),
                fulfillmentRepository.findByFinancialTransactionId(id),
                attachmentRepository.findByFinancialTransactionId(id)
        );
    }
}
