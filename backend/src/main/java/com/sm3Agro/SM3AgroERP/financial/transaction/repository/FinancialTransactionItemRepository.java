package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialTransactionItemRepository extends JpaRepository<FinancialTransactionItem, Long> {

    List<FinancialTransactionItem> findByFinancialTransactionId(Long financialTransactionId);

    List<FinancialTransactionItem> findByFinancialTransactionIdOrderByIdAsc(Long financialTransactionId);

    long countByFinancialTransactionId(Long financialTransactionId);

    Optional<FinancialTransactionItem> findByIdAndFinancialTransactionId(Long id, Long financialTransactionId);
}
