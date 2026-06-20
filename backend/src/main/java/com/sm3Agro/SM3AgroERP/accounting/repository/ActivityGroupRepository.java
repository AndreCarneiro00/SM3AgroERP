package com.sm3Agro.SM3AgroERP.accounting.repository;

import com.sm3Agro.SM3AgroERP.accounting.entity.ActivityGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityGroupRepository
        extends JpaRepository<ActivityGroup, Long> {
}