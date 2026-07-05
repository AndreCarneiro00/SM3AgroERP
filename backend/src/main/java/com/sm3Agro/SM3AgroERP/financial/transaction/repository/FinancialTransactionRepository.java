package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
}
