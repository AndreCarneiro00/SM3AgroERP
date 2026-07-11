import type { BankAccountDto } from '../../../domains/banking/api/dtos';
import type {
  BankTransferDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionType,
} from '../../../domains/financial/api/dtos';
import type { CashManagementState } from '../state/cashManagement';

interface LedgerMovement {
  date: string;
  amount: number;
}

interface NegativeBalanceProjection {
  date: string;
  balance: number;
}

interface TransferPayload {
  sourceBankAccountId?: number;
  destinationBankAccountId?: number;
  amount: number;
  transferDate: string;
}

interface FulfillmentPayload {
  bankAccountId: number;
  paymentDate: string;
  amountPaid: number;
}

interface MovementOptions {
  excludedTransferIds?: Set<number>;
  excludedFulfillmentIds?: Set<number>;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function currentIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBankAccount(state: CashManagementState, bankAccountId?: number) {
  return state.bankAccounts.find((bankAccount) => bankAccount.id === bankAccountId);
}

function getFinancialTransaction(
  state: CashManagementState,
  financialTransactionId?: number,
) {
  return state.financialTransactions.find(
    (financialTransaction) => financialTransaction.id === financialTransactionId,
  );
}

function resolveOpeningBalance(bankAccount: BankAccountDto) {
  return roundCurrency(bankAccount.initialBalance ?? 0);
}

function resolveOpeningDate(bankAccount: BankAccountDto) {
  return bankAccount.initialBalanceDate;
}

function requireOperationWithinOpeningBalanceHorizon(
  bankAccount: BankAccountDto,
  operationDate: string,
  accountLabel: string,
) {
  if (
    bankAccount.initialBalanceDate &&
    operationDate.localeCompare(bankAccount.initialBalanceDate) < 0
  ) {
    throw new Error(
      `${accountLabel} '${bankAccount.name}' cannot receive movements before its initial balance date (${bankAccount.initialBalanceDate}).`,
    );
  }
}

function resolveFulfillmentSignedAmount(
  financialTransaction: FinancialTransactionDto,
  fulfillment: FinancialTransactionFulfillmentDto,
) {
  return financialTransaction.type === 'INCOME'
    ? fulfillment.amountPaid
    : -fulfillment.amountPaid;
}

function aggregateDailyMovements(movements: LedgerMovement[]) {
  const totals = new Map<string, number>();

  movements.forEach((movement) => {
    totals.set(
      movement.date,
      roundCurrency((totals.get(movement.date) ?? 0) + movement.amount),
    );
  });

  return [...totals.entries()].sort(([leftDate], [rightDate]) =>
    leftDate.localeCompare(rightDate),
  );
}

function loadPersistedMovements(
  state: CashManagementState,
  bankAccount: BankAccountDto,
  options: MovementOptions = {},
) {
  const openingDate = resolveOpeningDate(bankAccount);
  const excludedTransferIds = options.excludedTransferIds ?? new Set<number>();
  const excludedFulfillmentIds =
    options.excludedFulfillmentIds ?? new Set<number>();
  const movements: LedgerMovement[] = [];

  state.financialTransactionFulfillments.forEach((fulfillment) => {
    if (fulfillment.bankAccountId !== bankAccount.id) {
      return;
    }

    if (excludedFulfillmentIds.has(fulfillment.id)) {
      return;
    }

    if (
      openingDate &&
      fulfillment.paymentDate.localeCompare(openingDate) < 0
    ) {
      return;
    }

    const financialTransaction = getFinancialTransaction(
      state,
      fulfillment.financialTransactionId,
    );

    if (!financialTransaction) {
      return;
    }

    movements.push({
      date: fulfillment.paymentDate,
      amount: resolveFulfillmentSignedAmount(financialTransaction, fulfillment),
    });
  });

  state.bankTransfers.forEach((bankTransfer) => {
    const isSource = bankTransfer.sourceBankAccountId === bankAccount.id;
    const isDestination =
      bankTransfer.destinationBankAccountId === bankAccount.id;

    if (!isSource && !isDestination) {
      return;
    }

    if (excludedTransferIds.has(bankTransfer.id)) {
      return;
    }

    if (
      openingDate &&
      bankTransfer.transferDate.localeCompare(openingDate) < 0
    ) {
      return;
    }

    movements.push({
      date: bankTransfer.transferDate,
      amount: isSource ? -bankTransfer.amount : bankTransfer.amount,
    });
  });

  return movements;
}

function findFirstNegativeProjection(
  state: CashManagementState,
  bankAccount: BankAccountDto,
  candidateMovements: LedgerMovement[],
  options: MovementOptions = {},
): NegativeBalanceProjection | undefined {
  let runningBalance = resolveOpeningBalance(bankAccount);
  const openingDate = resolveOpeningDate(bankAccount);
  const projectedMovements = [
    ...loadPersistedMovements(state, bankAccount, options),
    ...candidateMovements.filter(
      (movement) =>
        !openingDate || movement.date.localeCompare(openingDate) >= 0,
    ),
  ];

  for (const [date, amount] of aggregateDailyMovements(projectedMovements)) {
    runningBalance = roundCurrency(runningBalance + amount);

    if (runningBalance < -0.009) {
      return {
        date,
        balance: runningBalance,
      };
    }
  }

  return undefined;
}

export function calculateBankBalanceAtDate(
  state: CashManagementState,
  bankAccountId: number,
  asOfDate: string = currentIsoDate(),
) {
  const bankAccount = getBankAccount(state, bankAccountId);

  if (!bankAccount) {
    return 0;
  }

  const openingDate = resolveOpeningDate(bankAccount);

  if (openingDate && asOfDate.localeCompare(openingDate) < 0) {
    return 0;
  }

  let runningBalance = resolveOpeningBalance(bankAccount);

  for (const [date, amount] of aggregateDailyMovements(
    loadPersistedMovements(state, bankAccount),
  )) {
    if (date.localeCompare(asOfDate) > 0) {
      break;
    }

    runningBalance = roundCurrency(runningBalance + amount);
  }

  return runningBalance;
}

export function calculateCurrentBalance(
  state: CashManagementState,
  bankAccountId: number,
) {
  return calculateBankBalanceAtDate(state, bankAccountId);
}

export function withCurrentBalance(
  state: CashManagementState,
  bankAccount: BankAccountDto,
) {
  return {
    ...bankAccount,
    currentBalance: calculateCurrentBalance(state, bankAccount.id),
  };
}

export function listBankAccountsWithCurrentBalance(state: CashManagementState) {
  return state.bankAccounts.map((bankAccount) =>
    withCurrentBalance(state, bankAccount),
  );
}

export function validateBankTransfer(
  state: CashManagementState,
  payload: TransferPayload,
  excludedTransferId?: number,
) {
  const sourceBankAccount = getBankAccount(state, payload.sourceBankAccountId);
  const destinationBankAccount = getBankAccount(
    state,
    payload.destinationBankAccountId,
  );

  if (
    payload.sourceBankAccountId &&
    payload.sourceBankAccountId === payload.destinationBankAccountId
  ) {
    throw new Error('Source and destination bank accounts must be different.');
  }

  if (!sourceBankAccount || !destinationBankAccount) {
    return;
  }

  requireOperationWithinOpeningBalanceHorizon(
    sourceBankAccount,
    payload.transferDate,
    'Source bank account',
  );
  requireOperationWithinOpeningBalanceHorizon(
    destinationBankAccount,
    payload.transferDate,
    'Destination bank account',
  );

  const projection = findFirstNegativeProjection(
    state,
    sourceBankAccount,
    [
      {
        date: payload.transferDate,
        amount: -payload.amount,
      },
    ],
    {
      excludedTransferIds:
        excludedTransferId !== undefined ? new Set([excludedTransferId]) : undefined,
    },
  );

  if (projection) {
    throw new Error(
      `Transfer would make source bank account '${sourceBankAccount.name}' negative on ${projection.date}.`,
    );
  }
}

export function validateFulfillment(
  state: CashManagementState,
  financialTransactionId: number,
  payload: FulfillmentPayload,
  excludedFulfillmentId?: number,
) {
  const financialTransaction = getFinancialTransaction(state, financialTransactionId);
  const bankAccount = getBankAccount(state, payload.bankAccountId);

  if (!financialTransaction || !bankAccount) {
    return;
  }

  requireOperationWithinOpeningBalanceHorizon(
    bankAccount,
    payload.paymentDate,
    'Bank account',
  );

  if (financialTransaction.type !== 'EXPENSE') {
    return;
  }

  const projection = findFirstNegativeProjection(
    state,
    bankAccount,
    [
      {
        date: payload.paymentDate,
        amount: -payload.amountPaid,
      },
    ],
    {
      excludedFulfillmentIds:
        excludedFulfillmentId !== undefined
          ? new Set([excludedFulfillmentId])
          : undefined,
    },
  );

  if (projection) {
    throw new Error(
      `Expense fulfillment would make bank account '${bankAccount.name}' negative on ${projection.date}.`,
    );
  }
}

export function validateTransactionTypeChange(
  state: CashManagementState,
  financialTransactionId: number,
  projectedType: FinancialTransactionType,
) {
  const financialTransaction = getFinancialTransaction(state, financialTransactionId);

  if (
    !financialTransaction ||
    financialTransaction.type === projectedType ||
    projectedType !== 'EXPENSE'
  ) {
    return;
  }

  const fulfillments = state.financialTransactionFulfillments.filter(
    (fulfillment) => fulfillment.financialTransactionId === financialTransactionId,
  );

  if (fulfillments.length === 0) {
    return;
  }

  const excludedFulfillmentIds = new Set(
    fulfillments.map((fulfillment) => fulfillment.id),
  );
  const fulfillmentsByBankAccountId = new Map<number, FinancialTransactionFulfillmentDto[]>();

  fulfillments.forEach((fulfillment) => {
    const group = fulfillmentsByBankAccountId.get(fulfillment.bankAccountId) ?? [];
    group.push(fulfillment);
    fulfillmentsByBankAccountId.set(fulfillment.bankAccountId, group);
  });

  fulfillmentsByBankAccountId.forEach((bankAccountFulfillments, bankAccountId) => {
    const bankAccount = getBankAccount(state, bankAccountId);

    if (!bankAccount) {
      return;
    }

    const projectedMovements = bankAccountFulfillments.map((fulfillment) => {
      requireOperationWithinOpeningBalanceHorizon(
        bankAccount,
        fulfillment.paymentDate,
        'Bank account',
      );

      return {
        date: fulfillment.paymentDate,
        amount: -fulfillment.amountPaid,
      };
    });

    const projection = findFirstNegativeProjection(
      state,
      bankAccount,
      projectedMovements,
      { excludedFulfillmentIds },
    );

    if (projection) {
      throw new Error(
        `Changing transaction type to EXPENSE would make bank account '${bankAccount.name}' negative on ${projection.date}.`,
      );
    }
  });
}
