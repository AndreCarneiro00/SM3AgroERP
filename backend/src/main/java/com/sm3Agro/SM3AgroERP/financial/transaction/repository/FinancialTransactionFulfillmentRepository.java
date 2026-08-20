package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface FinancialTransactionFulfillmentRepository extends JpaRepository<FinancialTransactionFulfillment, Long> {

    List<FinancialTransactionFulfillment> findByFinancialTransactionId(Long financialTransactionId);

    List<FinancialTransactionFulfillment> findByFinancialTransactionIdAndStatus(
            Long financialTransactionId,
            CashMovementStatus status
    );

    Optional<FinancialTransactionFulfillment> findByIdAndFinancialTransactionId(Long id, Long financialTransactionId);

    boolean existsByBankAccountId(Long bankAccountId);

    long countByBankAccountId(Long bankAccountId);

    @Query("""
            select fulfillment
            from FinancialTransactionFulfillment fulfillment
            join fetch fulfillment.financialTransaction transaction
            left join fetch fulfillment.cancelFulfillment canceledFulfillment
            left join fetch canceledFulfillment.financialTransaction canceledTransaction
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
              and fulfillment.status = :activeStatus
            """)
    BigDecimal sumActiveAmountPaidByTransactionExcludingFulfillment(
            @Param("financialTransactionId") Long financialTransactionId,
            @Param("excludedFulfillmentId") Long excludedFulfillmentId,
            @Param("activeStatus") CashMovementStatus activeStatus
    );

    default BigDecimal sumAmountPaidByTransactionExcludingFulfillment(
            Long financialTransactionId,
            Long excludedFulfillmentId
    ) {
        return sumActiveAmountPaidByTransactionExcludingFulfillment(
                financialTransactionId,
                excludedFulfillmentId,
                CashMovementStatus.ACTIVE
        );
    }
}
