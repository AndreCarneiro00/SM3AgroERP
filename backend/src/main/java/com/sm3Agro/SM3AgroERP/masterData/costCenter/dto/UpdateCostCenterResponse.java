package com.sm3Agro.SM3AgroERP.masterData.costCenter.dto;

import com.sm3Agro.SM3AgroERP.masterData.costCenter.enums.CostCenterType;

public record UpdateCostCenterResponse(
        Long id,
        String name,
        String description,
        CostCenterType type,
        Boolean acceptsTransaction,
        Boolean active,
        Long parentId,
        Long activityGroupId,
        String code
) {}
