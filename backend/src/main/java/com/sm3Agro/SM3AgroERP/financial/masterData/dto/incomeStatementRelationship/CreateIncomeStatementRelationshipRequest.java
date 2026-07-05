package com.sm3Agro.SM3AgroERP.financial.masterData.dto.incomeStatementRelationship;

public record CreateIncomeStatementRelationshipRequest(
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
