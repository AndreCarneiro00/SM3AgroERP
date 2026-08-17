package com.sm3Agro.SM3AgroERP.masterData.activityGroup.repository;

import com.sm3Agro.SM3AgroERP.masterData.activityGroup.entity.ActivityGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityGroupRepository
        extends JpaRepository<ActivityGroup, Long> {
}