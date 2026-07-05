package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.accounting.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.accounting.repository.ChartOfAccountRepository;
import com.sm3Agro.SM3AgroERP.accounting.repository.CostCenterRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.domain.FinancialTransactionRules;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentAllocationRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionItemResult;
import com.sm3Agro.SM3AgroERP.inventory.entity.Product;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
public class FinancialTransactionItemService {

    private final FinancialTransactionItemRepository itemRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProductRepository productRepository;
    private final FinancialTransactionService transactionService;
    private final FinancialTransactionFulfillmentAllocationRepository allocationRepository;
    private final FinancialTransactionRules rules;

    public List<FinancialTransactionItemResult> createAll(
            FinancialTransaction financialTransaction,
            List<FinancialTransactionItemRequest> items
    ) {
        return items.stream()
                .map(itemRequest -> toResult(itemRepository.save(buildEntity(financialTransaction, itemRequest))))
                .toList();
    }

    @Transactional
    public FinancialTransactionItem create(Long financialTransactionId, FinancialTransactionItemRequest request) {
        FinancialTransaction transaction = transactionService.findMutableById(financialTransactionId);
        FinancialTransactionItem saved = itemRepository.save(buildEntity(transaction, request));
        transactionService.recalculate(financialTransactionId);
        return saved;
    }

    @Transactional
    public FinancialTransactionItem update(
            Long financialTransactionId,
            Long itemId,
            UpdateFinancialTransactionItemRequest request
    ) {
        transactionService.findMutableById(financialTransactionId);
        FinancialTransactionItem item = findOwnedItem(financialTransactionId, itemId);
        rules.requireItemAllocationNotOverAmount(
                request.amount(),
                allocationRepository.sumAmountByItemExcludingFulfillment(itemId, null)
        );

        item.setChartOfAccount(resolveChartOfAccount(request.chartOfAccountId()));
        item.setCostCenter(resolveCostCenter(request.costCenterId()));
        item.setQuantity(request.quantity());
        item.setUnitPrice(request.unitPrice());
        item.setAmount(request.amount());
        item.setProduct(resolveProduct(request.productId()));

        FinancialTransactionItem saved = itemRepository.save(item);
        transactionService.recalculate(financialTransactionId);
        return saved;
    }

    @Transactional
    public void delete(Long financialTransactionId, Long itemId) {
        transactionService.findMutableById(financialTransactionId);

        if (itemRepository.countByFinancialTransactionId(financialTransactionId) <= 1) {
            throw new IllegalArgumentException("Cannot remove the last financial transaction item.");
        }

        FinancialTransactionItem item = findOwnedItem(financialTransactionId, itemId);

        if (allocationRepository.existsByFinancialTransactionItemId(itemId)) {
            throw new IllegalArgumentException("Cannot remove a financial transaction item with payment allocations.");
        }

        itemRepository.delete(item);
        transactionService.recalculate(financialTransactionId);
    }

    private FinancialTransactionItem findOwnedItem(Long financialTransactionId, Long itemId) {
        return itemRepository.findByIdAndFinancialTransactionId(itemId, financialTransactionId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "FinancialTransactionItem not found: " + itemId
                ));
    }

    private FinancialTransactionItem buildEntity(
            FinancialTransaction financialTransaction,
            FinancialTransactionItemRequest itemRequest
    ) {
        return FinancialTransactionItem.builder()
                .financialTransaction(financialTransaction)
                .chartOfAccount(resolveChartOfAccount(itemRequest.chartOfAccountId()))
                .costCenter(resolveCostCenter(itemRequest.costCenterId()))
                .quantity(itemRequest.quantity())
                .unitPrice(itemRequest.unitPrice())
                .amount(itemRequest.amount())
                .product(resolveProduct(itemRequest.productId()))
                .build();
    }

    private ChartOfAccount resolveChartOfAccount(Long chartOfAccountId) {
        return chartOfAccountRepository.findById(chartOfAccountId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "ChartOfAccount not found: " + chartOfAccountId
                ));
    }

    private CostCenter resolveCostCenter(Long costCenterId) {
        return costCenterId == null
                ? null
                : costCenterRepository.findById(costCenterId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "CostCenter not found: " + costCenterId
                ));
    }

    private Product resolveProduct(Long productId) {
        return productId == null
                ? null
                : productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Product not found: " + productId
                ));
    }

    private FinancialTransactionItemResult toResult(FinancialTransactionItem saved) {
        return new FinancialTransactionItemResult(
                saved.getId(),
                saved.getChartOfAccount().getId(),
                saved.getCostCenter() != null ? saved.getCostCenter().getId() : null,
                saved.getQuantity(),
                saved.getUnitPrice(),
                saved.getAmount(),
                saved.getProduct() != null ? saved.getProduct().getId() : null
        );
    }
}
