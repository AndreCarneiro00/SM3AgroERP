package com.sm3Agro.SM3AgroERP.accounting.dto.chartOfAccount;

import com.sm3Agro.SM3AgroERP.accounting.enums.ChartOfAccountType;

public record FindAllChartOfAccountResponse(
        Long id,
        String name,
        Long parentId,
        ChartOfAccountType type,
        Boolean acceptsTransaction,
        Boolean active,
        String code
) {
}
