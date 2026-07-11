package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FinancialTransactionFulfillmentRepository extends JpaRepository<FinancialTransactionFulfillment, Long> {

    List<FinancialTransactionFulfillment> findByFinancialTransactionId(Long financialTransactionId);

    Optional<FinancialTransactionFulfillment> findByIdAndFinancialTransactionId(Long id, Long financialTransactionId);

    @Query("""
            select fulfillment
            from FinancialTransactionFulfillment fulfillment
            join fetch fulfillment.financialTransaction transaction
            where fulfillment.bankAccount.id = :bankAccountId
            """)
    List<FinancialTransactionFulfillment> findByBankAccountIdWithTransaction(
            @Param("bankAccountId") Long bankAccountId
    );

    @Query("""
            select coalesce(sum(fulfillment.amountPaid), 0)
            from FinancialTransactionFulfillment fulfillment
            where fulfillment.financialTransaction.id = :financialTransactionId
              and (:excludedFulfillmentId is null or fulfillment.id <> :excludedFulfillmentId)
            """)
    BigDecimal sumAmountPaidByTransactionExcludingFulfillment(
            @Param("financialTransactionId") Long financialTransactionId,
            @Param("excludedFulfillmentId") Long excludedFulfillmentId
    );
}
