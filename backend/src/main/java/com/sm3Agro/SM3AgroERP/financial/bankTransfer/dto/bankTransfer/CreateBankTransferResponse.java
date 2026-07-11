package com.sm3Agro.SM3AgroERP.financial.bankTransfer.dto.bankTransfer;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateBankTransferResponse(
        Long id,
        Long sourceBankAccountId,
        Long destinationBankAccountId,
        BigDecimal amount,
        LocalDate transferDate,
        String observation
) {
}
