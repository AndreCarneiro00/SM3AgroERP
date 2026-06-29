import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { inventoryRepository } from '../api/repository';
import {
  mapInventoryAdjustmentInputToDto,
  mapInventoryBatchInputToDto,
  mapInventoryMovementInputToDto,
} from '../model/mappers';
import type {
  InventoryAdjustmentInput,
  InventoryBatchInput,
  InventoryMovementInput,
} from '../model/entities';
import { inventoryKeys } from './keys';

function useInventoryInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateInventoryBatchMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (input: InventoryBatchInput) =>
      inventoryRepository.createInventoryBatch(
        mapInventoryBatchInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryBatches());
    },
  });
}

export function useUpdateInventoryBatchMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: InventoryBatchInput }) =>
      inventoryRepository.updateInventoryBatch(
        id,
        mapInventoryBatchInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryBatches());
    },
  });
}

export function useDeleteInventoryBatchMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (id: number) => inventoryRepository.deleteInventoryBatch(id),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryBatches());
    },
  });
}

export function useCreateInventoryMovementMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (input: InventoryMovementInput) =>
      inventoryRepository.createInventoryMovement(
        mapInventoryMovementInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(
        inventoryKeys.inventoryMovements(),
        inventoryKeys.inventoryAdjustments(),
      );
    },
  });
}

export function useUpdateInventoryMovementMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: InventoryMovementInput;
    }) =>
      inventoryRepository.updateInventoryMovement(
        id,
        mapInventoryMovementInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(
        inventoryKeys.inventoryMovements(),
        inventoryKeys.inventoryAdjustments(),
      );
    },
  });
}

export function useDeleteInventoryMovementMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (id: number) => inventoryRepository.deleteInventoryMovement(id),
    onSuccess: async () => {
      await invalidate(
        inventoryKeys.inventoryMovements(),
        inventoryKeys.inventoryAdjustments(),
      );
    },
  });
}

export function useCreateInventoryAdjustmentMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (input: InventoryAdjustmentInput) =>
      inventoryRepository.createInventoryAdjustment(
        mapInventoryAdjustmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryAdjustments());
    },
  });
}

export function useUpdateInventoryAdjustmentMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: InventoryAdjustmentInput;
    }) =>
      inventoryRepository.updateInventoryAdjustment(
        id,
        mapInventoryAdjustmentInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryAdjustments());
    },
  });
}

export function useDeleteInventoryAdjustmentMutation() {
  const invalidate = useInventoryInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      inventoryRepository.deleteInventoryAdjustment(id),
    onSuccess: async () => {
      await invalidate(inventoryKeys.inventoryAdjustments());
    },
  });
}
