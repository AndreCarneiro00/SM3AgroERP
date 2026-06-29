import { useMemo } from 'react';
import { createBankingCatalog } from '../model/mappers';
import {
  selectActiveBankAccounts,
  selectBankAccounts,
  selectTotalActiveBalance,
} from '../selectors/selectors';
import {
  useCreateBankAccountMutation,
  useDeleteBankAccountMutation,
  useUpdateBankAccountMutation,
} from '../queries/mutations';
import { useBankAccountsQuery } from '../queries/queries';

export function useBankAccountsData() {
  const bankAccountsQuery = useBankAccountsQuery();

  const catalog = useMemo(
    () =>
      createBankingCatalog({
        bankAccounts: bankAccountsQuery.data ?? [],
      }),
    [bankAccountsQuery.data],
  );

  const bankAccounts = useMemo(() => selectBankAccounts(catalog), [catalog]);
  const activeBankAccounts = useMemo(
    () => selectActiveBankAccounts(catalog),
    [catalog],
  );
  const totalActiveBalance = useMemo(
    () => selectTotalActiveBalance(catalog),
    [catalog],
  );

  return {
    catalog,
    bankAccounts,
    activeBankAccounts,
    totalActiveBalance,
    isLoading: bankAccountsQuery.isLoading,
    isFetching: bankAccountsQuery.isFetching,
  };
}

export function useBankAccountsMutations() {
  return {
    createBankAccount: useCreateBankAccountMutation(),
    updateBankAccount: useUpdateBankAccountMutation(),
    deleteBankAccount: useDeleteBankAccountMutation(),
  };
}
