import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { agriculturalRepository } from '../api/repository';
import {
  mapCutInputToDto,
  mapFieldInputToDto,
  mapFieldOperationInputToDto,
  mapFieldOperationItemInputToDto,
  mapFieldOperationMachineInputToDto,
  mapMachineInputToDto,
  mapProductionBatchInputToDto,
} from '../model/mappers';
import type {
  CutInput,
  FieldInput,
  FieldOperationInput,
  FieldOperationItemInput,
  FieldOperationMachineInput,
  MachineInput,
  ProductionBatchInput,
} from '../model/entities';
import { agriculturalKeys } from './keys';

function useAgriculturalInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateFieldMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: FieldInput) =>
      agriculturalRepository.createField(mapFieldInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fields());
    },
  });
}

export function useUpdateFieldMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: FieldInput }) =>
      agriculturalRepository.updateField(id, mapFieldInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fields());
    },
  });
}

export function useDeleteFieldMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) => agriculturalRepository.deleteField(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fields());
    },
  });
}

export function useCreateMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: MachineInput) =>
      agriculturalRepository.createMachine(mapMachineInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.machines());
    },
  });
}

export function useUpdateMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: MachineInput }) =>
      agriculturalRepository.updateMachine(id, mapMachineInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.machines());
    },
  });
}

export function useDeleteMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) => agriculturalRepository.deleteMachine(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.machines());
    },
  });
}

export function useCreateCutMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: CutInput) =>
      agriculturalRepository.createCut(mapCutInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.cuts());
    },
  });
}

export function useUpdateCutMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CutInput }) =>
      agriculturalRepository.updateCut(id, mapCutInputToDto(input)),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.cuts());
    },
  });
}

export function useDeleteCutMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) => agriculturalRepository.deleteCut(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.cuts());
    },
  });
}

export function useCreateFieldOperationMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: FieldOperationInput) =>
      agriculturalRepository.createFieldOperation(
        mapFieldOperationInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperations());
    },
  });
}

export function useUpdateFieldOperationMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: FieldOperationInput }) =>
      agriculturalRepository.updateFieldOperation(
        id,
        mapFieldOperationInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperations());
    },
  });
}

export function useDeleteFieldOperationMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) => agriculturalRepository.deleteFieldOperation(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperations());
    },
  });
}

export function useCreateFieldOperationMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: FieldOperationMachineInput) =>
      agriculturalRepository.createFieldOperationMachine(
        mapFieldOperationMachineInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationMachines());
    },
  });
}

export function useUpdateFieldOperationMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FieldOperationMachineInput;
    }) =>
      agriculturalRepository.updateFieldOperationMachine(
        id,
        mapFieldOperationMachineInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationMachines());
    },
  });
}

export function useDeleteFieldOperationMachineMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      agriculturalRepository.deleteFieldOperationMachine(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationMachines());
    },
  });
}

export function useCreateFieldOperationItemMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: FieldOperationItemInput) =>
      agriculturalRepository.createFieldOperationItem(
        mapFieldOperationItemInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationItems());
    },
  });
}

export function useUpdateFieldOperationItemMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: FieldOperationItemInput;
    }) =>
      agriculturalRepository.updateFieldOperationItem(
        id,
        mapFieldOperationItemInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationItems());
    },
  });
}

export function useDeleteFieldOperationItemMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      agriculturalRepository.deleteFieldOperationItem(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.fieldOperationItems());
    },
  });
}

export function useCreateProductionBatchMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (input: ProductionBatchInput) =>
      agriculturalRepository.createProductionBatch(
        mapProductionBatchInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.productionBatches());
    },
  });
}

export function useUpdateProductionBatchMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductionBatchInput }) =>
      agriculturalRepository.updateProductionBatch(
        id,
        mapProductionBatchInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.productionBatches());
    },
  });
}

export function useDeleteProductionBatchMutation() {
  const invalidate = useAgriculturalInvalidation();

  return useMutation({
    mutationFn: (id: number) => agriculturalRepository.deleteProductionBatch(id),
    onSuccess: async () => {
      await invalidate(agriculturalKeys.productionBatches());
    },
  });
}
