package com.sm3Agro.SM3AgroERP.masterData.bankAccount.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBankAccountRequest(
        String accountType,
        String accountGroup,
        String name,
        Boolean active,
        BigDecimal initialBalance,
        LocalDate initialBalanceDate,
        String financialInstitution,
        String agency,
        String accountNumber
) {
}
