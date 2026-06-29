import { useQueries, useQuery } from '@tanstack/react-query';
import { financialRepository } from '../api/repository';
import { financialKeys } from './keys';

export function useFinancialTransactionsQuery() {
  return useQuery({
    queryKey: financialKeys.financialTransactions(),
    queryFn: financialRepository.listFinancialTransactions,
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

export function useBankTransfersQuery() {
  return useQuery({
    queryKey: financialKeys.bankTransfers(),
    queryFn: financialRepository.listBankTransfers,
  });
}

export function useFinancialCatalogQueries() {
  const [
    financialTransactionsQuery,
    financialTransactionAttachmentsQuery,
    financialTransactionItemsQuery,
    financialTransactionFulfillmentsQuery,
    bankTransfersQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: financialKeys.financialTransactions(),
        queryFn: financialRepository.listFinancialTransactions,
      },
      {
        queryKey: financialKeys.financialTransactionAttachments(),
        queryFn: financialRepository.listFinancialTransactionAttachments,
      },
      {
        queryKey: financialKeys.financialTransactionItems(),
        queryFn: financialRepository.listFinancialTransactionItems,
      },
      {
        queryKey: financialKeys.financialTransactionFulfillments(),
        queryFn: financialRepository.listFinancialTransactionFulfillments,
      },
      {
        queryKey: financialKeys.bankTransfers(),
        queryFn: financialRepository.listBankTransfers,
      },
    ],
  });

  return {
    financialTransactionsQuery,
    financialTransactionAttachmentsQuery,
    financialTransactionItemsQuery,
    financialTransactionFulfillmentsQuery,
    bankTransfersQuery,
  };
}
