package com.sm3Agro.SM3AgroERP.production.repository;

import com.sm3Agro.SM3AgroERP.production.entity.Cut;
import com.sm3Agro.SM3AgroERP.production.enums.CutStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CutRepository extends JpaRepository<Cut, Long> {

    long countByFieldIdAndStatus(Long fieldId, CutStatus status);

    Optional<Cut> findTopByFieldIdAndStatusAndCutDateLessThanOrderByCutDateDescIdDesc(
            Long fieldId,
            CutStatus status,
            LocalDate cutDate
    );

    List<Cut> findAllByOrderByCutDateDescIdDesc();
}
