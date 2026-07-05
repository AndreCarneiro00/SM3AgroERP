package com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship;

public record UpdateIncomeStatementRelationshipRequest(
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
