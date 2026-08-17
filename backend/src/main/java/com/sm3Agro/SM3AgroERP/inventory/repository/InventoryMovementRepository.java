package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    boolean existsByBatchIdAndIdNot(Long batchId, Long id);

    List<InventoryMovement> findAllByOrderByMovementDateDescIdDesc();
}
