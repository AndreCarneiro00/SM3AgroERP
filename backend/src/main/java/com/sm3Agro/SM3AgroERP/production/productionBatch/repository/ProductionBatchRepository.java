package com.sm3Agro.SM3AgroERP.production.productionBatch.repository;

import com.sm3Agro.SM3AgroERP.production.productionBatch.entity.ProductionBatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionBatchRepository extends JpaRepository<ProductionBatch, Long> {

    Optional<ProductionBatch> findByCutId(Long cutId);

    List<ProductionBatch> findAllByOrderByIdDesc();
}
