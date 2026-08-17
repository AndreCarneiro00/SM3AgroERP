package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.InventoryAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryAdjustmentRepository extends JpaRepository<InventoryAdjustment, Long> {

    List<InventoryAdjustment> findAllByOrderByIdDesc();
}
