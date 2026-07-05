package com.sm3Agro.SM3AgroERP.financial.transaction.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialTransactionFulfillmentRequest(
        @NotNull
        Long bankAccountId,
        @NotNull
        LocalDate paymentDate,
        @NotNull
        @Positive
        BigDecimal amountPaid,
        String observation,
        @NotEmpty
        List<@Valid FinancialTransactionFulfillmentAllocationRequest> allocations
) {
}
