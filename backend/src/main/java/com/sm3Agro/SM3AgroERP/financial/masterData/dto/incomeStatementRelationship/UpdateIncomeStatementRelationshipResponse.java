package com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship;

public record UpdateIncomeStatementRelationshipResponse(
        Long id,
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
