package com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto;

public record CreateIncomeStatementRelationshipResponse(
        Long id,
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
