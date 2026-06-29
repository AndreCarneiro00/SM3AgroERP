import { useQueries, useQuery } from '@tanstack/react-query';
import { accountingRepository } from '../api/repository';
import { accountingKeys } from './keys';

export function useChartOfAccountsQuery() {
  return useQuery({
    queryKey: accountingKeys.chartOfAccounts(),
    queryFn: accountingRepository.listChartOfAccounts,
  });
}

export function useCostCentersQuery() {
  return useQuery({
    queryKey: accountingKeys.costCenters(),
    queryFn: accountingRepository.listCostCenters,
  });
}

export function useIncomeStatementGroupsQuery() {
  return useQuery({
    queryKey: accountingKeys.incomeStatementGroups(),
    queryFn: accountingRepository.listIncomeStatementGroups,
  });
}

export function useIncomeStatementRelationshipsQuery() {
  return useQuery({
    queryKey: accountingKeys.incomeStatementRelationships(),
    queryFn: accountingRepository.listIncomeStatementRelationships,
  });
}

export function useAccountingCatalogQueries() {
  const [
    chartOfAccountsQuery,
    costCentersQuery,
    incomeStatementGroupsQuery,
    incomeStatementRelationshipsQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: accountingKeys.chartOfAccounts(),
        queryFn: accountingRepository.listChartOfAccounts,
      },
      {
        queryKey: accountingKeys.costCenters(),
        queryFn: accountingRepository.listCostCenters,
      },
      {
        queryKey: accountingKeys.incomeStatementGroups(),
        queryFn: accountingRepository.listIncomeStatementGroups,
      },
      {
        queryKey: accountingKeys.incomeStatementRelationships(),
        queryFn: accountingRepository.listIncomeStatementRelationships,
      },
    ],
  });

  return {
    chartOfAccountsQuery,
    costCentersQuery,
    incomeStatementGroupsQuery,
    incomeStatementRelationshipsQuery,
  };
}
