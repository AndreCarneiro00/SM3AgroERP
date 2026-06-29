import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bankingRepository } from '../api/repository';
import { bankingKeys } from './keys';
import { mapBankAccountInputToDto } from '../model/mappers';
import type { BankAccountInput } from '../model/entities';

function useBankingInvalidation() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: bankingKeys.list() });
  };
}

export function useCreateBankAccountMutation() {
  const invalidate = useBankingInvalidation();

  return useMutation({
    mutationFn: (input: BankAccountInput) =>
      bankingRepository.createBankAccount(mapBankAccountInputToDto(input)),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useUpdateBankAccountMutation() {
  const invalidate = useBankingInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BankAccountInput }) =>
      bankingRepository.updateBankAccount(id, mapBankAccountInputToDto(input)),
    onSuccess: async () => {
      await invalidate();
    },
  });
}

export function useDeleteBankAccountMutation() {
  const invalidate = useBankingInvalidation();

  return useMutation({
    mutationFn: (id: number) => bankingRepository.deleteBankAccount(id),
    onSuccess: async () => {
      await invalidate();
    },
  });
}
