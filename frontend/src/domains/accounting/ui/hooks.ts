import { useMemo } from 'react';
import { createAccountingCatalog } from '../model/mappers';
import {
  selectChartOfAccounts,
  selectCostCenters,
  selectIncomeStatementGroups,
  selectIncomeStatementRelationshipRows,
  selectIncomeStatementRelationships,
  selectPostableChartOfAccounts,
  selectPostableCostCenters,
} from '../selectors/selectors';
import {
  useCreateChartOfAccountMutation,
  useCreateCostCenterMutation,
  useCreateIncomeStatementGroupMutation,
  useCreateIncomeStatementRelationshipMutation,
  useDeleteChartOfAccountMutation,
  useDeleteCostCenterMutation,
  useDeleteIncomeStatementGroupMutation,
  useDeleteIncomeStatementRelationshipMutation,
  useUpdateChartOfAccountMutation,
  useUpdateCostCenterMutation,
  useUpdateIncomeStatementGroupMutation,
  useUpdateIncomeStatementRelationshipMutation,
} from '../queries/mutations';
import { useAccountingCatalogQueries } from '../queries/queries';

export function useAccountingCatalogData() {
  const {
    chartOfAccountsQuery,
    costCentersQuery,
    incomeStatementGroupsQuery,
    incomeStatementRelationshipsQuery,
  } = useAccountingCatalogQueries();

  const catalog = useMemo(
    () =>
      createAccountingCatalog({
        chartOfAccounts: chartOfAccountsQuery.data ?? [],
        costCenters: costCentersQuery.data ?? [],
        incomeStatementGroups: incomeStatementGroupsQuery.data ?? [],
        incomeStatementRelationships:
          incomeStatementRelationshipsQuery.data ?? [],
      }),
    [
      chartOfAccountsQuery.data,
      costCentersQuery.data,
      incomeStatementGroupsQuery.data,
      incomeStatementRelationshipsQuery.data,
    ],
  );

  const chartOfAccounts = useMemo(
    () => selectChartOfAccounts(catalog),
    [catalog],
  );
  const postableChartOfAccounts = useMemo(
    () => selectPostableChartOfAccounts(catalog),
    [catalog],
  );
  const costCenters = useMemo(() => selectCostCenters(catalog), [catalog]);
  const postableCostCenters = useMemo(
    () => selectPostableCostCenters(catalog),
    [catalog],
  );
  const incomeStatementGroups = useMemo(
    () => selectIncomeStatementGroups(catalog),
    [catalog],
  );
  const incomeStatementRelationships = useMemo(
    () => selectIncomeStatementRelationships(catalog),
    [catalog],
  );
  const incomeStatementRelationshipRows = useMemo(
    () => selectIncomeStatementRelationshipRows(catalog),
    [catalog],
  );

  return {
    catalog,
    chartOfAccounts,
    postableChartOfAccounts,
    costCenters,
    postableCostCenters,
    incomeStatementGroups,
    incomeStatementRelationships,
    incomeStatementRelationshipRows,
    isLoading:
      chartOfAccountsQuery.isLoading ||
      costCentersQuery.isLoading ||
      incomeStatementGroupsQuery.isLoading ||
      incomeStatementRelationshipsQuery.isLoading,
    isFetching:
      chartOfAccountsQuery.isFetching ||
      costCentersQuery.isFetching ||
      incomeStatementGroupsQuery.isFetching ||
      incomeStatementRelationshipsQuery.isFetching,
  };
}

export function useAccountingMutations() {
  return {
    createChartOfAccount: useCreateChartOfAccountMutation(),
    updateChartOfAccount: useUpdateChartOfAccountMutation(),
    deleteChartOfAccount: useDeleteChartOfAccountMutation(),
    createCostCenter: useCreateCostCenterMutation(),
    updateCostCenter: useUpdateCostCenterMutation(),
    deleteCostCenter: useDeleteCostCenterMutation(),
    createIncomeStatementGroup: useCreateIncomeStatementGroupMutation(),
    updateIncomeStatementGroup: useUpdateIncomeStatementGroupMutation(),
    deleteIncomeStatementGroup: useDeleteIncomeStatementGroupMutation(),
    createIncomeStatementRelationship:
      useCreateIncomeStatementRelationshipMutation(),
    updateIncomeStatementRelationship:
      useUpdateIncomeStatementRelationshipMutation(),
    deleteIncomeStatementRelationship:
      useDeleteIncomeStatementRelationshipMutation(),
  };
}
