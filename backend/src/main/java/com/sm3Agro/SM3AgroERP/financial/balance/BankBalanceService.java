package com.sm3Agro.SM3AgroERP.financial.balance;

import com.sm3Agro.SM3AgroERP.financial.bankTransfer.entity.BankTransfer;
import com.sm3Agro.SM3AgroERP.financial.bankTransfer.repository.BankTransferRepository;
import com.sm3Agro.SM3AgroERP.financial.cashMovement.enums.CashMovementStatus;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransaction;
import com.sm3Agro.SM3AgroERP.financial.transaction.entity.FinancialTransactionFulfillment;
import com.sm3Agro.SM3AgroERP.financial.transaction.enums.FinancialTransactionType;
import com.sm3Agro.SM3AgroERP.financial.transaction.repository.FinancialTransactionFulfillmentRepository;
import com.sm3Agro.SM3AgroERP.masterData.bankAccount.entity.BankAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BankBalanceService {

    private final FinancialTransactionFulfillmentRepository fulfillmentRepository;
    private final BankTransferRepository bankTransferRepository;

    public BigDecimal calculateCurrentBalance(BankAccount bankAccount) {
        return calculateBalanceAtDate(bankAccount, LocalDate.now());
    }

    public BigDecimal calculateBalanceAtDate(BankAccount bankAccount, LocalDate asOfDate) {
        LocalDate openingDate = resolveOpeningDate(bankAccount);

        if (bankAccount.getInitialBalanceDate() != null && asOfDate.isBefore(openingDate)) {
            return BigDecimal.ZERO;
        }

        BigDecimal runningBalance = resolveOpeningBalance(bankAccount);
        List<LedgerMovement> persistedMovements = loadPersistedMovements(
                bankAccount.getId(),
                openingDate,
                Set.of(),
                Set.of()
        );

        return aggregateDailyMovements(persistedMovements).entrySet().stream()
                .filter(entry -> !entry.getKey().isAfter(asOfDate))
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .reduce(
                        runningBalance,
                        (balance, entry) -> balance.add(entry.getValue()),
                        BigDecimal::add
                );
    }

    public void validateTransfer(
            BankAccount sourceBankAccount,
            BankAccount destinationBankAccount,
            LocalDate transferDate,
            BigDecimal amount,
            Long excludedTransferId
    ) {
        requireOperationWithinOpeningBalanceHorizon(sourceBankAccount, transferDate, "Source bank account");
        requireOperationWithinOpeningBalanceHorizon(destinationBankAccount, transferDate, "Destination bank account");

        NegativeBalanceProjection projection = findFirstNegativeProjection(
                sourceBankAccount,
                List.of(new LedgerMovement(transferDate, normalize(amount).negate())),
                excludedTransferId != null ? Set.of(excludedTransferId) : Set.of(),
                Set.of()
        );

        if (projection != null) {
            throw new IllegalArgumentException(
                    "Transfer would make source bank account '" + sourceBankAccount.getName()
                            + "' negative on " + projection.date() + "."
            );
        }
    }

    public void validateTransferAdjustment(BankTransfer originalTransfer, LocalDate adjustmentDate) {
        BankAccount adjustmentSourceBankAccount = originalTransfer.getDestinationBankAccount();
        BankAccount adjustmentDestinationBankAccount = originalTransfer.getSourceBankAccount();

        requireOperationWithinOpeningBalanceHorizon(
                adjustmentSourceBankAccount,
                adjustmentDate,
                "Source bank account"
        );
        requireOperationWithinOpeningBalanceHorizon(
                adjustmentDestinationBankAccount,
                adjustmentDate,
                "Destination bank account"
        );

        NegativeBalanceProjection projection = findFirstNegativeProjection(
                adjustmentSourceBankAccount,
                List.of(new LedgerMovement(adjustmentDate, normalize(originalTransfer.getAmount()).negate())),
                Set.of(),
                Set.of()
        );

        if (projection != null) {
            throw new IllegalArgumentException(
                    "Transfer cancellation would make bank account '" + adjustmentSourceBankAccount.getName()
                            + "' negative on " + projection.date() + "."
            );
        }
    }

    public void validateFulfillment(
            FinancialTransaction transaction,
            BankAccount bankAccount,
            LocalDate paymentDate,
            BigDecimal amountPaid,
            Long excludedFulfillmentId
    ) {
        requireOperationWithinOpeningBalanceHorizon(bankAccount, paymentDate, "Bank account");

        if (transaction.getType() != FinancialTransactionType.EXPENSE) {
            return;
        }

        NegativeBalanceProjection projection = findFirstNegativeProjection(
                bankAccount,
                List.of(new LedgerMovement(paymentDate, normalize(amountPaid).negate())),
                Set.of(),
                excludedFulfillmentId != null ? Set.of(excludedFulfillmentId) : Set.of()
        );

        if (projection != null) {
            throw new IllegalArgumentException(
                    "Expense fulfillment would make bank account '" + bankAccount.getName()
                            + "' negative on " + projection.date() + "."
            );
        }
    }

    public void validateFulfillmentAdjustment(
            FinancialTransactionFulfillment originalFulfillment,
            LocalDate adjustmentDate
    ) {
        BankAccount bankAccount = originalFulfillment.getBankAccount();
        requireOperationWithinOpeningBalanceHorizon(bankAccount, adjustmentDate, "Bank account");

        BigDecimal adjustmentAmount = resolveBaseFulfillmentSignedAmount(originalFulfillment).negate();
        if (adjustmentAmount.compareTo(BigDecimal.ZERO) >= 0) {
            return;
        }

        NegativeBalanceProjection projection = findFirstNegativeProjection(
                bankAccount,
                List.of(new LedgerMovement(adjustmentDate, adjustmentAmount)),
                Set.of(),
                Set.of()
        );

        if (projection != null) {
            throw new IllegalArgumentException(
                    "Fulfillment cancellation would make bank account '" + bankAccount.getName()
                            + "' negative on " + projection.date() + "."
            );
        }
    }

    public void validateTransactionTypeChange(
            FinancialTransaction transaction,
            FinancialTransactionType projectedType
    ) {
        if (transaction.getType() == projectedType || projectedType != FinancialTransactionType.EXPENSE) {
            return;
        }

        List<FinancialTransactionFulfillment> fulfillments =
                fulfillmentRepository.findByFinancialTransactionId(transaction.getId());

        if (fulfillments.isEmpty()) {
            return;
        }

        Set<Long> excludedFulfillmentIds = fulfillments.stream()
                .map(FinancialTransactionFulfillment::getId)
                .collect(Collectors.toSet());

        fulfillments.stream()
                .collect(Collectors.groupingBy(FinancialTransactionFulfillment::getBankAccount))
                .forEach((bankAccount, bankAccountFulfillments) -> {
                    List<LedgerMovement> projectedMovements = new ArrayList<>();

                    for (FinancialTransactionFulfillment fulfillment : bankAccountFulfillments) {
                        requireOperationWithinOpeningBalanceHorizon(
                                bankAccount,
                                fulfillment.getPaymentDate(),
                                "Bank account"
                        );

                        projectedMovements.add(new LedgerMovement(
                                fulfillment.getPaymentDate(),
                                normalize(fulfillment.getAmountPaid()).negate()
                        ));
                    }

                    NegativeBalanceProjection projection = findFirstNegativeProjection(
                            bankAccount,
                            projectedMovements,
                            Set.of(),
                            excludedFulfillmentIds
                    );

                    if (projection != null) {
                        throw new IllegalArgumentException(
                                "Changing transaction type to EXPENSE would make bank account '"
                                        + bankAccount.getName() + "' negative on " + projection.date() + "."
                        );
                    }
                });
    }

    private void requireOperationWithinOpeningBalanceHorizon(
            BankAccount bankAccount,
            LocalDate operationDate,
            String accountLabel
    ) {
        LocalDate openingDate = bankAccount.getInitialBalanceDate();

        if (openingDate != null && operationDate.isBefore(openingDate)) {
            throw new IllegalArgumentException(
                    accountLabel + " '" + bankAccount.getName()
                            + "' cannot receive movements before its initial balance date ("
                            + openingDate + ")."
            );
        }
    }

    private NegativeBalanceProjection findFirstNegativeProjection(
            BankAccount bankAccount,
            List<LedgerMovement> candidateMovements,
            Set<Long> excludedTransferIds,
            Set<Long> excludedFulfillmentIds
    ) {
        LocalDate openingDate = resolveOpeningDate(bankAccount);
        BigDecimal runningBalance = resolveOpeningBalance(bankAccount);
        List<LedgerMovement> projectedMovements = new ArrayList<>(
                loadPersistedMovements(
                        bankAccount.getId(),
                        openingDate,
                        excludedTransferIds,
                        excludedFulfillmentIds
                )
        );
        projectedMovements.addAll(candidateMovements);

        for (Map.Entry<LocalDate, BigDecimal> entry : aggregateDailyMovements(projectedMovements).entrySet()) {
            runningBalance = runningBalance.add(entry.getValue());

            if (runningBalance.compareTo(BigDecimal.ZERO) < 0) {
                return new NegativeBalanceProjection(entry.getKey(), runningBalance);
            }
        }

        return null;
    }

    private TreeMap<LocalDate, BigDecimal> aggregateDailyMovements(List<LedgerMovement> movements) {
        TreeMap<LocalDate, BigDecimal> dailyNetAmount = new TreeMap<>();

        for (LedgerMovement movement : movements) {
            dailyNetAmount.merge(movement.date(), movement.amount(), BigDecimal::add);
        }

        return dailyNetAmount;
    }

    private List<LedgerMovement> loadPersistedMovements(
            Long bankAccountId,
            LocalDate openingDate,
            Set<Long> excludedTransferIds,
            Set<Long> excludedFulfillmentIds
    ) {
        List<LedgerMovement> movements = new ArrayList<>();

        for (FinancialTransactionFulfillment fulfillment : fulfillmentRepository.findByBankAccountIdWithTransaction(bankAccountId)) {
            if (excludedFulfillmentIds.contains(fulfillment.getId())) {
                continue;
            }

            if (fulfillment.getPaymentDate() == null || fulfillment.getPaymentDate().isBefore(openingDate)) {
                continue;
            }

            BigDecimal signedAmount = resolveFulfillmentSignedAmount(fulfillment);
            movements.add(new LedgerMovement(fulfillment.getPaymentDate(), signedAmount));
        }

        for (BankTransfer bankTransfer : bankTransferRepository.findBySourceBankAccountIdOrDestinationBankAccountId(
                bankAccountId,
                bankAccountId
        )) {
            if (excludedTransferIds.contains(bankTransfer.getId())) {
                continue;
            }

            if (bankTransfer.getTransferDate() == null || bankTransfer.getTransferDate().isBefore(openingDate)) {
                continue;
            }

            BigDecimal signedAmount = bankTransfer.getSourceBankAccount().getId().equals(bankAccountId)
                    ? normalize(bankTransfer.getAmount()).negate()
                    : normalize(bankTransfer.getAmount());

            movements.add(new LedgerMovement(bankTransfer.getTransferDate(), signedAmount));
        }

        return movements;
    }

    private BigDecimal resolveFulfillmentSignedAmount(FinancialTransactionFulfillment fulfillment) {
        if (fulfillment.getStatus() == CashMovementStatus.ADJUSTMENT) {
            FinancialTransactionFulfillment canceledFulfillment = fulfillment.getCancelFulfillment();
            if (canceledFulfillment == null) {
                throw new IllegalStateException(
                        "Adjustment fulfillment must reference the canceled fulfillment."
                );
            }

            return resolveBaseFulfillmentSignedAmount(canceledFulfillment).negate();
        }

        return resolveBaseFulfillmentSignedAmount(fulfillment);
    }

    private BigDecimal resolveBaseFulfillmentSignedAmount(FinancialTransactionFulfillment fulfillment) {
        FinancialTransaction transaction = fulfillment.getFinancialTransaction();
        if (transaction.getType() == FinancialTransactionType.INCOME) {
            return normalize(fulfillment.getAmountPaid());
        }

        return normalize(fulfillment.getAmountPaid()).negate();
    }

    private LocalDate resolveOpeningDate(BankAccount bankAccount) {
        return bankAccount.getInitialBalanceDate() != null
                ? bankAccount.getInitialBalanceDate()
                : LocalDate.MIN;
    }

    private BigDecimal resolveOpeningBalance(BankAccount bankAccount) {
        return normalize(bankAccount.getInitialBalance());
    }

    private BigDecimal normalize(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private record LedgerMovement(
            LocalDate date,
            BigDecimal amount
    ) {
    }

    private record NegativeBalanceProjection(
            LocalDate date,
            BigDecimal balance
    ) {
    }
}
