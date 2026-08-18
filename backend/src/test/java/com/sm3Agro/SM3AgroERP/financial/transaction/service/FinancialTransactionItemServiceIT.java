package com.sm3Agro.SM3AgroERP.financial.transaction.service;

import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.FinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.dto.request.UpdateFinancialTransactionItemRequest;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.support.AbstractFinancialTransactionIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@ActiveProfiles("test")
class FinancialTransactionItemServiceIT extends AbstractFinancialTransactionIT {

    @Autowired
    private FinancialTransactionItemService itemService;

    @Test
    void shouldPersistItemsWithResolvedReferences() {
        FinancialTransaction transaction = createPersistedTransaction();
        var chart = createChartOfAccount();
        var costCenter = createCostCenter();
        var product = createProduct();

        var result = itemService.createAll(transaction, List.of(
                new FinancialTransactionItemRequest(
                        chart.getId(),
                        costCenter.getId(),
                        new BigDecimal("2.00"),
                        new BigDecimal("50.00"),
                        new BigDecimal("100.00"),
                        product.getId()
                )
        ));

        assertEquals(1, result.size());
        assertEquals(1, financialTransactionItemRepository.count());
        assertEquals(chart.getId(), result.getFirst().chartOfAccountId());
    }

    @Test
    void shouldRejectProductItemWithoutPositiveQuantityWhenCreating() {
        FinancialTransaction transaction = createPersistedTransaction();
        var chart = createChartOfAccount();
        var product = createProduct();

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> itemService.createAll(transaction, List.of(
                new FinancialTransactionItemRequest(
                        chart.getId(),
                        null,
                        BigDecimal.ZERO,
                        new BigDecimal("50.00"),
                        new BigDecimal("100.00"),
                        product.getId()
                )
        )));

        assertEquals("Product financial transaction item quantity must be greater than zero.", exception.getMessage());
    }

    @Test
    void shouldRejectProductItemWithoutPositiveQuantityWhenUpdating() {
        FinancialTransaction transaction = createPersistedTransaction();
        var item = createPersistedTransactionItem(transaction);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> itemService.update(
                transaction.getId(),
                item.getId(),
                new UpdateFinancialTransactionItemRequest(
                        item.getChartOfAccount().getId(),
                        item.getCostCenter().getId(),
                        BigDecimal.ZERO,
                        new BigDecimal("50.00"),
                        new BigDecimal("100.00"),
                        item.getProduct().getId()
                )
        ));

        assertEquals("Product financial transaction item quantity must be greater than zero.", exception.getMessage());
    }

    @Test
    void shouldThrowWhenChartOfAccountDoesNotExist() {
        FinancialTransaction transaction = createPersistedTransaction();

        assertThrows(RuntimeException.class, () -> itemService.createAll(transaction, List.of(
                new FinancialTransactionItemRequest(
                        99999L,
                        null,
                        new BigDecimal("2.00"),
                        new BigDecimal("50.00"),
                        new BigDecimal("100.00"),
                        null
                )
        )));
    }
}

