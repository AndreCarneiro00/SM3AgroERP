import {
  type QueryKey,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { masterDataRepository } from '../api/repository';
import { masterDataKeys } from './keys';
import {
  mapActivityGroupInputToDto,
  mapAdjustmentRootCauseInputToDto,
  mapCounterpartyInputToDto,
  mapCounterpartyTypeInputToDto,
  mapDocumentTypeInputToDto,
  mapSegmentInputToDto,
} from '../model/mappers';
import type {
  ActivityGroupInput,
  AdjustmentRootCauseInput,
  CounterpartyInput,
  CounterpartyTypeInput,
  DocumentTypeInput,
  SegmentInput,
} from '../model/entities';

function useMasterDataInvalidation() {
  const queryClient = useQueryClient();

  return async (...keys: readonly QueryKey[]) => {
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
  };
}

export function useCreateCounterpartyTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: CounterpartyTypeInput) =>
      masterDataRepository.createCounterpartyType(
        mapCounterpartyTypeInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.counterpartyTypes());
    },
  });
}

export function useUpdateCounterpartyTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: CounterpartyTypeInput;
    }) =>
      masterDataRepository.updateCounterpartyType(
        id,
        mapCounterpartyTypeInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(
        masterDataKeys.counterpartyTypes(),
        masterDataKeys.counterparties(),
      );
    },
  });
}

export function useDeleteCounterpartyTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) => masterDataRepository.deleteCounterpartyType(id),
    onSuccess: async () => {
      await invalidate(
        masterDataKeys.counterpartyTypes(),
        masterDataKeys.counterparties(),
      );
    },
  });
}

export function useCreateSegmentMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: SegmentInput) =>
      masterDataRepository.createSegment(mapSegmentInputToDto(input)),
    onSuccess: async () => {
      await invalidate(masterDataKeys.segments());
    },
  });
}

export function useUpdateSegmentMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SegmentInput }) =>
      masterDataRepository.updateSegment(id, mapSegmentInputToDto(input)),
    onSuccess: async () => {
      await invalidate(masterDataKeys.segments(), masterDataKeys.counterparties());
    },
  });
}

export function useDeleteSegmentMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) => masterDataRepository.deleteSegment(id),
    onSuccess: async () => {
      await invalidate(masterDataKeys.segments(), masterDataKeys.counterparties());
    },
  });
}

export function useCreateActivityGroupMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: ActivityGroupInput) =>
      masterDataRepository.createActivityGroup(
        mapActivityGroupInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.activityGroups());
    },
  });
}

export function useUpdateActivityGroupMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ActivityGroupInput }) =>
      masterDataRepository.updateActivityGroup(
        id,
        mapActivityGroupInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.activityGroups());
    },
  });
}

export function useDeleteActivityGroupMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) => masterDataRepository.deleteActivityGroup(id),
    onSuccess: async () => {
      await invalidate(masterDataKeys.activityGroups());
    },
  });
}

export function useCreateDocumentTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: DocumentTypeInput) =>
      masterDataRepository.createDocumentType(
        mapDocumentTypeInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.documentTypes());
    },
  });
}

export function useUpdateDocumentTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: DocumentTypeInput }) =>
      masterDataRepository.updateDocumentType(
        id,
        mapDocumentTypeInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.documentTypes());
    },
  });
}

export function useDeleteDocumentTypeMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) => masterDataRepository.deleteDocumentType(id),
    onSuccess: async () => {
      await invalidate(masterDataKeys.documentTypes());
    },
  });
}

export function useCreateAdjustmentRootCauseMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: AdjustmentRootCauseInput) =>
      masterDataRepository.createAdjustmentRootCause(
        mapAdjustmentRootCauseInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.adjustmentRootCauses());
    },
  });
}

export function useUpdateAdjustmentRootCauseMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number;
      input: AdjustmentRootCauseInput;
    }) =>
      masterDataRepository.updateAdjustmentRootCause(
        id,
        mapAdjustmentRootCauseInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.adjustmentRootCauses());
    },
  });
}

export function useDeleteAdjustmentRootCauseMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) =>
      masterDataRepository.deleteAdjustmentRootCause(id),
    onSuccess: async () => {
      await invalidate(masterDataKeys.adjustmentRootCauses());
    },
  });
}

export function useCreateCounterpartyMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (input: CounterpartyInput) =>
      masterDataRepository.createCounterparty(mapCounterpartyInputToDto(input)),
    onSuccess: async () => {
      await invalidate(masterDataKeys.counterparties());
    },
  });
}

export function useUpdateCounterpartyMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CounterpartyInput }) =>
      masterDataRepository.updateCounterparty(
        id,
        mapCounterpartyInputToDto(input),
      ),
    onSuccess: async () => {
      await invalidate(masterDataKeys.counterparties());
    },
  });
}

export function useDeleteCounterpartyMutation() {
  const invalidate = useMasterDataInvalidation();

  return useMutation({
    mutationFn: (id: number) => masterDataRepository.deleteCounterparty(id),
    onSuccess: async () => {
      await invalidate(masterDataKeys.counterparties());
    },
  });
}
