import type { FinancialDateRange } from '../model/dateRange';

export const financialKeys = {
  all: ['financial'] as const,
  financialTransactions: (dateRange?: FinancialDateRange) =>
    dateRange
      ? [...financialKeys.all, 'financialTransactions', dateRange] as const
      : [...financialKeys.all, 'financialTransactions'] as const,
  financialTransactionDetails: (dateRange?: FinancialDateRange) =>
    dateRange
      ? [...financialKeys.all, 'financialTransactionDetails', dateRange] as const
      : [...financialKeys.all, 'financialTransactionDetails'] as const,
  financialTransactionAttachments: () =>
    [...financialKeys.all, 'financialTransactionAttachments'] as const,
  financialTransactionItems: () =>
    [...financialKeys.all, 'financialTransactionItems'] as const,
  financialTransactionFulfillments: () =>
    [...financialKeys.all, 'financialTransactionFulfillments'] as const,
  bankTransfers: (dateRange?: FinancialDateRange) =>
    dateRange
      ? [...financialKeys.all, 'bankTransfers', dateRange] as const
      : [...financialKeys.all, 'bankTransfers'] as const,
};
