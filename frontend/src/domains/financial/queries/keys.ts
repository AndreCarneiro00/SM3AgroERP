export const financialKeys = {
  all: ['financial'] as const,
  financialTransactions: () =>
    [...financialKeys.all, 'financialTransactions'] as const,
  financialTransactionAttachments: () =>
    [...financialKeys.all, 'financialTransactionAttachments'] as const,
  financialTransactionItems: () =>
    [...financialKeys.all, 'financialTransactionItems'] as const,
  financialTransactionFulfillments: () =>
    [...financialKeys.all, 'financialTransactionFulfillments'] as const,
  bankTransfers: () => [...financialKeys.all, 'bankTransfers'] as const,
};
