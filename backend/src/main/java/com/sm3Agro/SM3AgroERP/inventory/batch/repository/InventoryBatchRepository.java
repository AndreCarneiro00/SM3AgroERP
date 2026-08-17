package com.sm3Agro.SM3AgroERP.inventory.batch.repository;

import com.sm3Agro.SM3AgroERP.inventory.batch.entity.InventoryBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryBatchRepository extends JpaRepository<InventoryBatch, Long> {

    boolean existsByProductId(Long productId);

    List<InventoryBatch> findAllByOrderByBatchDateDescIdDesc();
}
