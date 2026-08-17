package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryBatch;
import com.sm3Agro.SM3AgroERP.inventory.enums.InventoryBatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    List<InventoryBatch> findAllByOrderByBatchDateDescIdDesc();

    boolean existsByProductId(Long productId);

    List<InventoryBatch> findByProductIdAndStatusAndQuantityGreaterThanOrderByBatchDateAscIdAsc(
            Long productId,
            InventoryBatchStatus status,
            BigDecimal quantity
    );
}
