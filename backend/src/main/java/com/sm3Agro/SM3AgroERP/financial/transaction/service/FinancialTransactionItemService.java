package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.entity.ChartOfAccount;
import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.repository.ChartOfAccountRepository;
import com.sm3Agro.SM3AgroERP.masterData.costCenter.entity.CostCenter;
import com.sm3Agro.SM3AgroERP.masterData.costCenter.repository.CostCenterRepository;
import com.sm3Agro.SM3AgroERP.masterData.product.entity.Product;
import com.sm3Agro.SM3AgroERP.masterData.product.repository.ProductRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionItemRepository;
import com.sm3Agro.SM3AgroERP.financial.transaction.usecase.create.FinancialTransactionItemResult;
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
    private final FinancialTransactionService transactionService;

    private static final String STRUCTURAL_ITEM_CHANGE_MESSAGE =
            "Financial transaction items can only be defined during transaction creation.";

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
        transactionService.findMutableById(financialTransactionId);
        throw new IllegalArgumentException(STRUCTURAL_ITEM_CHANGE_MESSAGE);
    }

    @Transactional
    public FinancialTransactionItem update(
            Long financialTransactionId,
            Long itemId,
            UpdateFinancialTransactionItemRequest request
    ) {
        transactionService.findMutableById(financialTransactionId);
        findOwnedItem(financialTransactionId, itemId);
        throw new IllegalArgumentException(STRUCTURAL_ITEM_CHANGE_MESSAGE);
    }

    @Transactional
    public void delete(Long financialTransactionId, Long itemId) {
        transactionService.findMutableById(financialTransactionId);
        findOwnedItem(financialTransactionId, itemId);
        throw new IllegalArgumentException(STRUCTURAL_ITEM_CHANGE_MESSAGE);
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
        Product product = resolveProduct(itemRequest.productId());
        requirePositiveQuantityForProduct(product, itemRequest.quantity());

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
                .product(product)
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

    private void requirePositiveQuantityForProduct(Product product, BigDecimal quantity) {
        if (product != null && (quantity == null || quantity.signum() <= 0)) {
            throw new IllegalArgumentException("Product financial transaction item quantity must be greater than zero.");
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
