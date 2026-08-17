package com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.dto;

import com.sm3Agro.SM3AgroERP.masterData.chartOfAccount.enums.ChartOfAccountType;

public record CreateChartOfAccountResponse(
        Long id,
        String name,
        Long parentId,
        ChartOfAccountType type,
        Boolean acceptsTransaction,
        Boolean active,
        String code
) {
}
