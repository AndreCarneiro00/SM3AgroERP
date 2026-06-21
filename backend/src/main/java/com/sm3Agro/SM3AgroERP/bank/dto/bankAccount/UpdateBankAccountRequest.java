package com.sm3Agro.SM3AgroERP.bank.dto.bankAccount;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateBankAccountRequest(
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
