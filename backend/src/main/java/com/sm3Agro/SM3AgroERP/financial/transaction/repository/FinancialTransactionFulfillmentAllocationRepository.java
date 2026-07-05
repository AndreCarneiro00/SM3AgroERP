package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillmentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface FinancialTransactionFulfillmentAllocationRepository
        extends JpaRepository<FinancialTransactionFulfillmentAllocation, Long> {

    List<FinancialTransactionFulfillmentAllocation> findByFulfillmentId(Long fulfillmentId);

    List<FinancialTransactionFulfillmentAllocation> findByFulfillmentFinancialTransactionId(Long financialTransactionId);

    boolean existsByFinancialTransactionItemId(Long financialTransactionItemId);

    void deleteByFulfillmentId(Long fulfillmentId);

    @Query("""
            select coalesce(sum(allocation.amount), 0)
            from FinancialTransactionFulfillmentAllocation allocation
            where allocation.financialTransactionItem.id = :itemId
              and (:excludedFulfillmentId is null or allocation.fulfillment.id <> :excludedFulfillmentId)
            """)
    BigDecimal sumAmountByItemExcludingFulfillment(
            @Param("itemId") Long itemId,
            @Param("excludedFulfillmentId") Long excludedFulfillmentId
    );
}
