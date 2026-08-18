package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {

    @Query("""
            select financialTransaction
            from FinancialTransaction financialTransaction
            where (:startDate is null or financialTransaction.issueDate >= :startDate)
              and (:endDate is null or financialTransaction.issueDate <= :endDate)
            order by financialTransaction.issueDate desc, financialTransaction.id desc
            """)
    List<FinancialTransaction> findAllByIssueDatePeriod(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
