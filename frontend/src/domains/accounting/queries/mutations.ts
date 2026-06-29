import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { accountingRepository } from '../api/repository';
import { accountingKeys } from './keys';
import {
  mapChartOfAccountInputToDto,
  mapCostCenterInputToDto,
  mapIncomeStatementGroupInputToDto,
  mapIncomeStatementRelationshipInputToDto,
} from '../model/mappers';
import type {
  ChartOfAccountInput,
  CostCenterInput,
  IncomeStatementGroupInput,
  IncomeStatementRelationshipInput,
} from '../model/entities';

function useAccountingInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateChartOfAccountMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (input: ChartOfAccountInput) =>
      accountingRepository.createChartOfAccount(
        mapChartOfAccountInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.chartOfAccounts());
    },
  });
}

export function useUpdateChartOfAccountMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ChartOfAccountInput }) =>
      accountingRepository.updateChartOfAccount(
        id,
        mapChartOfAccountInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.chartOfAccounts());
    },
  });
}

export function useDeleteChartOfAccountMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (id: number) => accountingRepository.deleteChartOfAccount(id),
    onSuccess: async () => {
      await invalidate(accountingKeys.chartOfAccounts());
    },
  });
}

export function useCreateCostCenterMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (input: CostCenterInput) =>
      accountingRepository.createCostCenter(mapCostCenterInputToDto(input)),
    onSuccess: async () => {
      await invalidate(accountingKeys.costCenters());
    },
  });
}

export function useUpdateCostCenterMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CostCenterInput }) =>
      accountingRepository.updateCostCenter(id, mapCostCenterInputToDto(input)),
    onSuccess: async () => {
      await invalidate(accountingKeys.costCenters());
    },
  });
}

export function useDeleteCostCenterMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (id: number) => accountingRepository.deleteCostCenter(id),
    onSuccess: async () => {
      await invalidate(accountingKeys.costCenters());
    },
  });
}

export function useCreateIncomeStatementGroupMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (input: IncomeStatementGroupInput) =>
      accountingRepository.createIncomeStatementGroup(
        mapIncomeStatementGroupInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementGroups());
    },
  });
}

export function useUpdateIncomeStatementGroupMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: IncomeStatementGroupInput;
    }) =>
      accountingRepository.updateIncomeStatementGroup(
        id,
        mapIncomeStatementGroupInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementGroups());
    },
  });
}

export function useDeleteIncomeStatementGroupMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      accountingRepository.deleteIncomeStatementGroup(id),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementGroups());
    },
  });
}

export function useCreateIncomeStatementRelationshipMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (input: IncomeStatementRelationshipInput) =>
      accountingRepository.createIncomeStatementRelationship(
        mapIncomeStatementRelationshipInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementRelationships());
    },
  });
}

export function useUpdateIncomeStatementRelationshipMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: IncomeStatementRelationshipInput;
    }) =>
      accountingRepository.updateIncomeStatementRelationship(
        id,
        mapIncomeStatementRelationshipInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementRelationships());
    },
  });
}

export function useDeleteIncomeStatementRelationshipMutation() {
  const invalidate = useAccountingInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      accountingRepository.deleteIncomeStatementRelationship(id),
    onSuccess: async () => {
      await invalidate(accountingKeys.incomeStatementRelationships());
    },
  });
}
