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
import com.sm3Agro.SM3AgroERP.inventory.repository.InventoryMovementRepository;
import com.sm3Agro.SM3AgroERP.inventory.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@RequiredArgsConstructor
@Service
public class FinancialTransactionItemService {

    private final FinancialTransactionItemRepository itemRepository;
    private final ChartOfAccountRepository chartOfAccountRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProductRepository productRepository;
    private final InventoryMovementRepository inventoryMovementRepository;
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
        FinancialTransactionItem entity = buildEntity(transaction, request);
        requireProductAllowedOutsideFullCreation(entity.getProduct());
        FinancialTransactionItem saved = itemRepository.save(entity);
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
        requireItemWithoutStockMovement(itemId);

        BigDecimal resolvedAmount = resolveAmount(
                request.quantity(),
                request.unitPrice(),
                request.amount()
        );
        rules.requireItemAllocationNotOverAmount(
                resolvedAmount,
                allocationRepository.sumAmountByItemExcludingFulfillment(itemId, null)
        );

        item.setChartOfAccount(resolveChartOfAccount(request.chartOfAccountId()));
        item.setCostCenter(resolveCostCenter(request.costCenterId()));
        item.setQuantity(request.quantity());
        item.setUnitPrice(request.unitPrice());
        item.setAmount(resolvedAmount);
        Product product = resolveProduct(request.productId());
        requireProductAllowedOutsideFullCreation(product);
        item.setProduct(product);

        FinancialTransactionItem saved = itemRepository.save(item);
        transactionService.recalculate(financialTransactionId);
        return saved;
    }

    @Transactional
    public void delete(Long financialTransactionId, Long itemId) {
        transactionService.findMutableById(financialTransactionId);

        FinancialTransactionItem item = findOwnedItem(financialTransactionId, itemId);
        requireItemWithoutStockMovement(itemId);

        if (itemRepository.countByFinancialTransactionId(financialTransactionId) <= 1) {
            throw new IllegalArgumentException("Cannot remove the last financial transaction item.");
        }

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
                .amount(resolveAmount(
                        itemRequest.quantity(),
                        itemRequest.unitPrice(),
                        itemRequest.amount()
                ))
                .product(resolveProduct(itemRequest.productId()))
                .build();
    }

    private BigDecimal resolveAmount(
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal providedAmount
    ) {
        if (quantity == null || unitPrice == null) {
            return providedAmount;
        }

        return quantity.multiply(unitPrice).setScale(2, RoundingMode.HALF_UP);
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

    private void requireProductAllowedOutsideFullCreation(Product product) {
        if (product == null) {
            return;
        }

        if (product.getHasStock() == null) {
            throw new IllegalArgumentException("Product must be classified for stock control before use.");
        }

        if (Boolean.TRUE.equals(product.getHasStock())) {
            throw new IllegalArgumentException(
                    "Stock-controlled financial items can only be created in the full transaction creation flow."
            );
        }
    }

    private void requireItemWithoutStockMovement(Long itemId) {
        if (inventoryMovementRepository.existsByFinancialTransactionItemId(itemId)) {
            throw new IllegalArgumentException(
                    "Financial transaction item cannot be changed because it has an inventory movement."
            );
        }
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
