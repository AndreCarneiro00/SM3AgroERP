import { useMemo } from 'react';
import { createFinancialCatalog } from '../model/mappers';
import {
  useCreateBankTransferMutation,
  useCreateFinancialTransactionAttachmentMutation,
  useCreateFinancialTransactionFulfillmentMutation,
  useCreateFinancialTransactionItemMutation,
  useCreateFinancialTransactionMutation,
  useCancelBankTransferMutation,
  useCancelFinancialTransactionFulfillmentMutation,
  useDeleteBankTransferMutation,
  useDeleteFinancialTransactionAttachmentMutation,
  useDeleteFinancialTransactionFulfillmentMutation,
  useDeleteFinancialTransactionItemMutation,
  useDeleteFinancialTransactionMutation,
  useReplaceFinancialTransactionAttachmentFileMutation,
  useUpdateBankTransferMutation,
  useUpdateFinancialTransactionAttachmentMutation,
  useUpdateFinancialTransactionFulfillmentMutation,
  useUpdateFinancialTransactionItemMutation,
  useUpdateFinancialTransactionMutation,
} from '../queries/mutations';
import {
  type FinancialCatalogQueryFilters,
  useFinancialCatalogQueries,
} from '../queries/queries';
import {
  selectBankTransfers,
  selectFinancialTransactionAttachments,
  selectFinancialTransactionFulfillments,
  selectFinancialTransactionItems,
  selectFinancialTransactions,
} from '../selectors/selectors';

export function useFinancialCatalogData(filters: FinancialCatalogQueryFilters = {}) {
  const {
    financialTransactionDetailsQuery,
    bankTransfersQuery,
  } = useFinancialCatalogQueries(filters);

  const catalog = useMemo(
    () =>
      createFinancialCatalog({
        financialTransactions: financialTransactionDetailsQuery.data ?? [],
        bankTransfers: bankTransfersQuery.data ?? [],
      }),
    [
      financialTransactionDetailsQuery.data,
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
      financialTransactionDetailsQuery.isLoading ||
      bankTransfersQuery.isLoading,
    isFetching:
      financialTransactionDetailsQuery.isFetching ||
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
    replaceFinancialTransactionAttachmentFile:
      useReplaceFinancialTransactionAttachmentFileMutation(),
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
    cancelFinancialTransactionFulfillment:
      useCancelFinancialTransactionFulfillmentMutation(),
    createBankTransfer: useCreateBankTransferMutation(),
    updateBankTransfer: useUpdateBankTransferMutation(),
    deleteBankTransfer: useDeleteBankTransferMutation(),
    cancelBankTransfer: useCancelBankTransferMutation(),
  };
}
