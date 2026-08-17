package com.sm3Agro.SM3AgroERP.inventory.movement.repository;

import com.sm3Agro.SM3AgroERP.inventory.movement.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    boolean existsByBatchProductId(Long productId);

    boolean existsByBatchIdAndIdNot(Long batchId, Long id);

    boolean existsByFinancialTransactionItemId(Long financialTransactionItemId);

    @Query("""
            select case when count(m) > 0 then true else false end
            from InventoryMovement m
            where m.financialTransactionItemId in (
                select item.id
                from FinancialTransactionItem item
                where item.financialTransaction.id = :financialTransactionId
            )
            """)
    boolean existsByFinancialTransactionId(Long financialTransactionId);

    Optional<InventoryMovement> findByFinancialTransactionItemId(Long financialTransactionItemId);

    List<InventoryMovement> findAllByOrderByMovementDateDescIdDesc();
}
