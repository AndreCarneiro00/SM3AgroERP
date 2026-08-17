package com.sm3Agro.SM3AgroERP.masterData.incomeStatementRelationship.dto;

public record UpdateIncomeStatementRelationshipResponse(
        Long id,
        Long chartOfAccountId,
        Long incomeStatementGroupId
) {
}
