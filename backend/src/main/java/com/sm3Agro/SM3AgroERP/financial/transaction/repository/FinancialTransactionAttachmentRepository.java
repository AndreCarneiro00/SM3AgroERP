package com.sm3Agro.SM3AgroERP.financial.transaction.repository;

import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FinancialTransactionAttachmentRepository extends JpaRepository<FinancialTransactionAttachment, Long> {

    List<FinancialTransactionAttachment> findByFinancialTransactionId(Long financialTransactionId);

    Optional<FinancialTransactionAttachment> findByIdAndFinancialTransactionId(Long id, Long financialTransactionId);
}
