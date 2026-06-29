import { useMemo } from 'react';
import { createFinancialCatalog } from '../model/mappers';
import {
  useCreateBankTransferMutation,
  useCreateFinancialTransactionAttachmentMutation,
  useCreateFinancialTransactionFulfillmentMutation,
  useCreateFinancialTransactionItemMutation,
  useCreateFinancialTransactionMutation,
  useDeleteBankTransferMutation,
  useDeleteFinancialTransactionAttachmentMutation,
  useDeleteFinancialTransactionFulfillmentMutation,
  useDeleteFinancialTransactionItemMutation,
  useDeleteFinancialTransactionMutation,
  useUpdateBankTransferMutation,
  useUpdateFinancialTransactionAttachmentMutation,
  useUpdateFinancialTransactionFulfillmentMutation,
  useUpdateFinancialTransactionItemMutation,
  useUpdateFinancialTransactionMutation,
} from '../queries/mutations';
import { useFinancialCatalogQueries } from '../queries/queries';
import {
  selectBankTransfers,
  selectFinancialTransactionAttachments,
  selectFinancialTransactionFulfillments,
  selectFinancialTransactionItems,
  selectFinancialTransactions,
} from '../selectors/selectors';

export function useFinancialCatalogData() {
  const {
    financialTransactionsQuery,
    financialTransactionAttachmentsQuery,
    financialTransactionItemsQuery,
    financialTransactionFulfillmentsQuery,
    bankTransfersQuery,
  } = useFinancialCatalogQueries();

  const catalog = useMemo(
    () =>
      createFinancialCatalog({
        financialTransactions: financialTransactionsQuery.data ?? [],
        financialTransactionAttachments:
          financialTransactionAttachmentsQuery.data ?? [],
        financialTransactionItems: financialTransactionItemsQuery.data ?? [],
        financialTransactionFulfillments:
          financialTransactionFulfillmentsQuery.data ?? [],
        bankTransfers: bankTransfersQuery.data ?? [],
      }),
    [
      financialTransactionsQuery.data,
      financialTransactionAttachmentsQuery.data,
      financialTransactionItemsQuery.data,
      financialTransactionFulfillmentsQuery.data,
      bankTransfersQuery.data,
    ],
  );

  const financialTransactions = useMemo(
    () => selectFinancialTransactions(catalog),
    [catalog],
  );
  const financialTransactionAttachments = useMemo(
    () => selectFinancialTransactionAttachments(catalog),
    [catalog],
  );
  const financialTransactionItems = useMemo(
    () => selectFinancialTransactionItems(catalog),
    [catalog],
  );
  const financialTransactionFulfillments = useMemo(
    () => selectFinancialTransactionFulfillments(catalog),
    [catalog],
  );
  const bankTransfers = useMemo(() => selectBankTransfers(catalog), [catalog]);

  return {
    catalog,
    financialTransactions,
    financialTransactionAttachments,
    financialTransactionItems,
    financialTransactionFulfillments,
    bankTransfers,
    isLoading:
      financialTransactionsQuery.isLoading ||
      financialTransactionAttachmentsQuery.isLoading ||
      financialTransactionItemsQuery.isLoading ||
      financialTransactionFulfillmentsQuery.isLoading ||
      bankTransfersQuery.isLoading,
    isFetching:
      financialTransactionsQuery.isFetching ||
      financialTransactionAttachmentsQuery.isFetching ||
      financialTransactionItemsQuery.isFetching ||
      financialTransactionFulfillmentsQuery.isFetching ||
      bankTransfersQuery.isFetching,
  };
}

export function useFinancialMutations() {
  return {
    createFinancialTransaction: useCreateFinancialTransactionMutation(),
    updateFinancialTransaction: useUpdateFinancialTransactionMutation(),
    deleteFinancialTransaction: useDeleteFinancialTransactionMutation(),
    createFinancialTransactionAttachment:
      useCreateFinancialTransactionAttachmentMutation(),
    updateFinancialTransactionAttachment:
      useUpdateFinancialTransactionAttachmentMutation(),
    deleteFinancialTransactionAttachment:
      useDeleteFinancialTransactionAttachmentMutation(),
    createFinancialTransactionItem: useCreateFinancialTransactionItemMutation(),
    updateFinancialTransactionItem: useUpdateFinancialTransactionItemMutation(),
    deleteFinancialTransactionItem: useDeleteFinancialTransactionItemMutation(),
    createFinancialTransactionFulfillment:
      useCreateFinancialTransactionFulfillmentMutation(),
    updateFinancialTransactionFulfillment:
      useUpdateFinancialTransactionFulfillmentMutation(),
    deleteFinancialTransactionFulfillment:
      useDeleteFinancialTransactionFulfillmentMutation(),
    createBankTransfer: useCreateBankTransferMutation(),
    updateBankTransfer: useUpdateBankTransferMutation(),
    deleteBankTransfer: useDeleteBankTransferMutation(),
  };
}
