package com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto;

public record CreateIncomeStatementRelationshipRequest(
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
