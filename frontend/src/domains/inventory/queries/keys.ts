export const inventoryKeys = {
  all: ['inventory'] as const,
  inventoryBatches: () => [...inventoryKeys.all, 'batches'] as const,
  inventoryMovements: () => [...inventoryKeys.all, 'movements'] as const,
  inventoryAdjustments: () => [...inventoryKeys.all, 'adjustments'] as const,
};
