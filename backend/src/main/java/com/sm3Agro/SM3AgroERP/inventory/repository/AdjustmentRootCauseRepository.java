package com.sm3Agro.SM3AgroERP.inventory.repository;

import com.sm3Agro.SM3AgroERP.inventory.entity.AdjustmentRootCause;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdjustmentRootCauseRepository extends JpaRepository<AdjustmentRootCause, Long> {

    Optional<AdjustmentRootCause> findByName(String name);
}
