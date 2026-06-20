package com.sm3Agro.SM3AgroERP.accounting.repository;

import com.sm3Agro.SM3AgroERP.accounting.entity.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CostCenterRepository
        extends JpaRepository<CostCenter, Long> {
}