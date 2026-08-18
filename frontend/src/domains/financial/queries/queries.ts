import { useQueries, useQuery } from '@tanstack/react-query';
import { financialRepository } from '../api/repository';
import type { FinancialDateRange } from '../model/dateRange';
import { financialKeys } from './keys';

export interface FinancialCatalogQueryFilters {
  financialTransactions?: FinancialDateRange;
  bankTransfers?: FinancialDateRange;
}

export function useFinancialTransactionsQuery(dateRange?: FinancialDateRange) {
  return useQuery({
    queryKey: financialKeys.financialTransactions(dateRange),
    queryFn: () => financialRepository.listFinancialTransactions(dateRange),
  });
}

export function useFinancialTransactionDetailsQuery(dateRange?: FinancialDateRange) {
  return useQuery({
    queryKey: financialKeys.financialTransactionDetails(dateRange),
    queryFn: () => financialRepository.listFinancialTransactionDetails(dateRange),
  });
}

export function useFinancialTransactionAttachmentsQuery() {
  return useQuery({
    queryKey: financialKeys.financialTransactionAttachments(),
    queryFn: financialRepository.listFinancialTransactionAttachments,
  });
}

export function useFinancialTransactionItemsQuery() {
  return useQuery({
    queryKey: financialKeys.financialTransactionItems(),
    queryFn: financialRepository.listFinancialTransactionItems,
  });
}

export function useFinancialTransactionFulfillmentsQuery() {
  return useQuery({
    queryKey: financialKeys.financialTransactionFulfillments(),
    queryFn: financialRepository.listFinancialTransactionFulfillments,
  });
}

export function useBankTransfersQuery(dateRange?: FinancialDateRange) {
  return useQuery({
    queryKey: financialKeys.bankTransfers(dateRange),
    queryFn: () => financialRepository.listBankTransfers(dateRange),
  });
}

export function useFinancialCatalogQueries(filters: FinancialCatalogQueryFilters = {}) {
  const [
    financialTransactionDetailsQuery,
    bankTransfersQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: financialKeys.financialTransactionDetails(
          filters.financialTransactions,
        ),
        queryFn: () =>
          financialRepository.listFinancialTransactionDetails(
            filters.financialTransactions,
          ),
      },
      {
        queryKey: financialKeys.bankTransfers(filters.bankTransfers),
        queryFn: () =>
          financialRepository.listBankTransfers(filters.bankTransfers),
      },
    ],
  });

  return {
    financialTransactionDetailsQuery,
    bankTransfersQuery,
  };
}
