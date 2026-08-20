import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { bankingKeys } from '../../banking/queries/keys';
import { inventoryKeys } from '../../inventory/queries/keys';
import { financialRepository } from '../api/repository';
import {
  mapBankTransferInputToDto,
  mapCancelBankTransferInputToDto,
  mapCancelFinancialTransactionFulfillmentInputToDto,
  mapCancelFinancialTransactionInputToDto,
  mapCreateFinancialTransactionInputToMultipartDto,
  mapFinancialTransactionAttachmentInputToDto,
  mapFinancialTransactionFulfillmentInputToDto,
  mapFinancialTransactionInputToDto,
  mapFinancialTransactionItemInputToDto,
} from '../model/mappers';
import type {
  BankTransferInput,
  CancelBankTransferInput,
  CancelFinancialTransactionFulfillmentInput,
  CancelFinancialTransactionInput,
  CreateFinancialTransactionInput,
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

function useFinancialGraphInvalidation() {
  const invalidate = useFinancialInvalidation();

  return async () => {
    await invalidate(
      financialKeys.financialTransactions(),
      financialKeys.financialTransactionDetails(),
      financialKeys.financialTransactionAttachments(),
      financialKeys.financialTransactionItems(),
      financialKeys.financialTransactionFulfillments(),
    );
  };
}

function useFinancialCashGraphInvalidation() {
  const invalidate = useFinancialInvalidation();

  return async () => {
    await invalidate(
      financialKeys.financialTransactions(),
      financialKeys.financialTransactionDetails(),
      financialKeys.financialTransactionAttachments(),
      financialKeys.financialTransactionItems(),
      financialKeys.financialTransactionFulfillments(),
      bankingKeys.list(),
    );
  };
}

export function useCreateFinancialTransactionMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: CreateFinancialTransactionInput) =>
      financialRepository.createFinancialTransaction(
        mapCreateFinancialTransactionInputToMultipartDto(input),
      ),
    onSuccess: async () => {
      await Promise.all([
        invalidateGraph(),
        invalidate(
          inventoryKeys.inventoryBatches(),
          inventoryKeys.inventoryMovements(),
        ),
      ]);
    },
  });
}

export function useUpdateFinancialTransactionMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();

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
    onSuccess: invalidateGraph,
  });
}

export function useDeleteFinancialTransactionMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input?: CancelFinancialTransactionInput;
    }) =>
      financialRepository.deleteFinancialTransaction(
        id,
        input ? mapCancelFinancialTransactionInputToDto(input) : undefined,
      ),
    onSuccess: invalidateGraph,
  });
}

export function useCreateFinancialTransactionAttachmentMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionAttachmentInput) => {
      if (!input.financialTransactionId || !input.file) {
        throw new Error('Transacao e arquivo sao obrigatorios para anexar.');
      }

      return financialRepository.createFinancialTransactionAttachment(
        mapFinancialTransactionAttachmentInputToDto(input),
        input.financialTransactionId,
        input.file,
      );
    },
    onSuccess: invalidateGraph,
  });
}

export function useUpdateFinancialTransactionAttachmentMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FinancialTransactionAttachmentInput;
    }) => {
      if (!input.financialTransactionId) {
        throw new Error('Transacao e obrigatoria para editar o anexo.');
      }

      return financialRepository.updateFinancialTransactionAttachment(
        id,
        input.financialTransactionId,
        mapFinancialTransactionAttachmentInputToDto(input),
      );
    },
    onSuccess: invalidateGraph,
  });
}

export function useReplaceFinancialTransactionAttachmentFileMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      financialTransactionId,
      file,
    }: {
      id: number;
      financialTransactionId: number;
      file: File;
    }) =>
      financialRepository.replaceFinancialTransactionAttachmentFile(
        financialTransactionId,
        id,
        file,
      ),
    onSuccess: invalidateGraph,
  });
}

export function useDeleteFinancialTransactionAttachmentMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: ({
      financialTransactionId,
      id,
    }: {
      financialTransactionId: number;
      id: number;
    }) =>
      financialRepository.deleteFinancialTransactionAttachment(
        financialTransactionId,
        id,
      ),
    onSuccess: invalidateGraph,
  });
}

export function useCreateFinancialTransactionItemMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionItemInput) =>
      financialRepository.createFinancialTransactionItem(
        mapFinancialTransactionItemInputToDto(input),
      ),
    onSuccess: invalidateGraph,
  });
}

export function useUpdateFinancialTransactionItemMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

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
    onSuccess: invalidateGraph,
  });
}

export function useDeleteFinancialTransactionItemMutation() {
  const invalidateGraph = useFinancialGraphInvalidation();

  return useMutation({
    mutationFn: ({
      financialTransactionId,
      id,
    }: {
      financialTransactionId: number;
      id: number;
    }) => financialRepository.deleteFinancialTransactionItem(financialTransactionId, id),
    onSuccess: invalidateGraph,
  });
}

export function useCreateFinancialTransactionFulfillmentMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();

  return useMutation({
    mutationFn: (input: FinancialTransactionFulfillmentInput) =>
      financialRepository.createFinancialTransactionFulfillment(
        mapFinancialTransactionFulfillmentInputToDto(input),
      ),
    onSuccess: invalidateGraph,
  });
}

export function useUpdateFinancialTransactionFulfillmentMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();

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
    onSuccess: invalidateGraph,
  });
}

export function useDeleteFinancialTransactionFulfillmentMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();

  return useMutation({
    mutationFn: ({
      financialTransactionId,
      id,
    }: {
      financialTransactionId: number;
      id: number;
    }) =>
      financialRepository.deleteFinancialTransactionFulfillment(
        financialTransactionId,
        id,
      ),
    onSuccess: invalidateGraph,
  });
}

export function useCancelFinancialTransactionFulfillmentMutation() {
  const invalidateGraph = useFinancialCashGraphInvalidation();

  return useMutation({
    mutationFn: ({
      financialTransactionId,
      id,
      input,
    }: {
      financialTransactionId: number;
      id: number;
      input: CancelFinancialTransactionFulfillmentInput;
    }) =>
      financialRepository.cancelFinancialTransactionFulfillment(
        financialTransactionId,
        id,
        mapCancelFinancialTransactionFulfillmentInputToDto(input),
      ),
    onSuccess: invalidateGraph,
  });
}

export function useCreateBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (input: BankTransferInput) =>
      financialRepository.createBankTransfer(mapBankTransferInputToDto(input)),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers(), bankingKeys.list());
    },
  });
}

export function useUpdateBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: BankTransferInput }) =>
      financialRepository.updateBankTransfer(id, mapBankTransferInputToDto(input)),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers(), bankingKeys.list());
    },
  });
}

export function useDeleteBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: (id: number) => financialRepository.deleteBankTransfer(id),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers(), bankingKeys.list());
    },
  });
}

export function useCancelBankTransferMutation() {
  const invalidate = useFinancialInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CancelBankTransferInput }) =>
      financialRepository.cancelBankTransfer(
        id,
        mapCancelBankTransferInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(financialKeys.bankTransfers(), bankingKeys.list());
    },
  });
}
