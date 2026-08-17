package com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto;

public record UpdateIncomeStatementRelationshipRequest(
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
