package com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship;

public record FindAllIncomeStatementRelationshipResponse(
        Long id,
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
