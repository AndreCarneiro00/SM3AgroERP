package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    boolean existsByBatchIdAndIdNot(Long batchId, Long id);

    boolean existsByBatchProductId(Long productId);

    boolean existsByFinancialTransactionItemId(Long financialTransactionItemId);

    Optional<InventoryMovement> findByFinancialTransactionItemId(Long financialTransactionItemId);

    @Query("""
            select count(m) > 0
            from InventoryMovement m
            where m.financialTransactionItemId in (
                select i.id
                from FinancialTransactionItem i
                where i.financialTransaction.id = :financialTransactionId
            )
            """)
    boolean existsByFinancialTransactionId(@Param("financialTransactionId") Long financialTransactionId);

    List<InventoryMovement> findAllByOrderByMovementDateDescIdDesc();
}
