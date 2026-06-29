import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { financialRepository } from '../api/repository';
import {
  mapBankTransferInputToDto,
  mapFinancialTransactionAttachmentInputToDto,
  mapFinancialTransactionFulfillmentInputToDto,
  mapFinancialTransactionInputToDto,
  mapFinancialTransactionItemInputToDto,
} from '../model/mappers';
import type {
  BankTransferInput,
  FinancialTransactionAttachmentInput,
  FinancialTransactionFulfillmentInput,
  FinancialTransactionInput,
  FinancialTransactionItemInput,
} from '../model/entities';
import { financialKeys } from './keys';

function useFinancialInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateFinancialTransactionMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionInput) =>
      financialRepository.createFinancialTransaction(
        mapFinancialTransactionInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactions());
    },
  });
}

export function useUpdateFinancialTransactionMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FinancialTransactionInput;
    }) =>
      financialRepository.updateFinancialTransaction(
        id,
        mapFinancialTransactionInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactions());
    },
  });
}

export function useDeleteFinancialTransactionMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) => financialRepository.deleteFinancialTransaction(id),
    onSuccess: async () => {
      await invalidate(
        financialKeys.financialTransactions(),
        financialKeys.financialTransactionAttachments(),
        financialKeys.financialTransactionItems(),
        financialKeys.financialTransactionFulfillments(),
      );
    },
  });
}

export function useCreateFinancialTransactionAttachmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionAttachmentInput) =>
      financialRepository.createFinancialTransactionAttachment(
        mapFinancialTransactionAttachmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionAttachments());
    },
  });
}

export function useUpdateFinancialTransactionAttachmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FinancialTransactionAttachmentInput;
    }) =>
      financialRepository.updateFinancialTransactionAttachment(
        id,
        mapFinancialTransactionAttachmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionAttachments());
    },
  });
}

export function useDeleteFinancialTransactionAttachmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      financialRepository.deleteFinancialTransactionAttachment(id),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionAttachments());
    },
  });
}

export function useCreateFinancialTransactionItemMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionItemInput) =>
      financialRepository.createFinancialTransactionItem(
        mapFinancialTransactionItemInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionItems());
    },
  });
}

export function useUpdateFinancialTransactionItemMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FinancialTransactionItemInput;
    }) =>
      financialRepository.updateFinancialTransactionItem(
        id,
        mapFinancialTransactionItemInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionItems());
    },
  });
}

export function useDeleteFinancialTransactionItemMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) => financialRepository.deleteFinancialTransactionItem(id),
    onSuccess: async () => {
      await invalidate(financialKeys.financialTransactionItems());
    },
  });
}

export function useCreateFinancialTransactionFulfillmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionFulfillmentInput) =>
      financialRepository.createFinancialTransactionFulfillment(
        mapFinancialTransactionFulfillmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(
        financialKeys.financialTransactionFulfillments(),
        financialKeys.financialTransactions(),
      );
    },
  });
}

export function useUpdateFinancialTransactionFulfillmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FinancialTransactionFulfillmentInput;
    }) =>
      financialRepository.updateFinancialTransactionFulfillment(
        id,
        mapFinancialTransactionFulfillmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(
        financialKeys.financialTransactionFulfillments(),
        financialKeys.financialTransactions(),
      );
    },
  });
}

export function useDeleteFinancialTransactionFulfillmentMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      financialRepository.deleteFinancialTransactionFulfillment(id),
    onSuccess: async () => {
      await invalidate(
        financialKeys.financialTransactionFulfillments(),
        financialKeys.financialTransactions(),
      );
    },
  });
}

export function useCreateBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: BankTransferInput) =>
      financialRepository.createBankTransfer(mapBankTransferInputToDto(input)),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers());
    },
  });
}

export function useUpdateBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BankTransferInput }) =>
      financialRepository.updateBankTransfer(id, mapBankTransferInputToDto(input)),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers());
    },
  });
}

export function useDeleteBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) => financialRepository.deleteBankTransfer(id),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers());
    },
  });
}
