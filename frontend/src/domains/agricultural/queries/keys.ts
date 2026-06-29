export const agriculturalKeys = {
  all: ['agricultural'] as const,
  fields: () => [...agriculturalKeys.all, 'fields'] as const,
  machines: () => [...agriculturalKeys.all, 'machines'] as const,
  cuts: () => [...agriculturalKeys.all, 'cuts'] as const,
  fieldOperations: () => [...agriculturalKeys.all, 'fieldOperations'] as const,
  fieldOperationMachines: () =>
    [...agriculturalKeys.all, 'fieldOperationMachines'] as const,
  fieldOperationItems: () =>
    [...agriculturalKeys.all, 'fieldOperationItems'] as const,
  productionBatches: () =>
    [...agriculturalKeys.all, 'productionBatches'] as const,
};
