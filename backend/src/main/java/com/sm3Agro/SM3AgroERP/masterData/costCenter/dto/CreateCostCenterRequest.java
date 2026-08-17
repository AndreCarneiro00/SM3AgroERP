package com.sm3Agro.SM3AgroERP.masterData.costCenter.dto;

import com.sm3Agro.SM3AgroERP.masterData.costCenter.enums.CostCenterType;

public record CreateCostCenterRequest(
        String name,
        String description,
        CostCenterType type,
        Boolean acceptsTransaction,
        Boolean active,
        Long parentId,
        Long activityGroupId,
        String code
) {}
