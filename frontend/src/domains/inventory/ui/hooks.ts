import { useMemo } from 'react';
import { createInventoryCatalog } from '../model/mappers';
import {
  useCreateInventoryAdjustmentMutation,
  useCreateInventoryBatchMutation,
  useCreateInventoryMovementMutation,
  useDeleteInventoryAdjustmentMutation,
  useDeleteInventoryBatchMutation,
  useDeleteInventoryMovementMutation,
  useUpdateInventoryAdjustmentMutation,
  useUpdateInventoryBatchMutation,
  useUpdateInventoryMovementMutation,
} from '../queries/mutations';
import { useInventoryCatalogQueries } from '../queries/queries';
import {
  selectInventoryAdjustments,
  selectInventoryBatches,
  selectInventoryMovements,
} from '../selectors/selectors';

export function useInventoryCatalogData() {
  const {
    inventoryBatchesQuery,
    inventoryMovementsQuery,
    inventoryAdjustmentsQuery,
  } = useInventoryCatalogQueries();

  const catalog = useMemo(
    () =>
      createInventoryCatalog({
        inventoryBatches: inventoryBatchesQuery.data ?? [],
        inventoryMovements: inventoryMovementsQuery.data ?? [],
        inventoryAdjustments: inventoryAdjustmentsQuery.data ?? [],
      }),
    [
      inventoryBatchesQuery.data,
      inventoryMovementsQuery.data,
      inventoryAdjustmentsQuery.data,
    ],
  );

  const inventoryBatches = useMemo(
    () => selectInventoryBatches(catalog),
    [catalog],
  );
  const inventoryMovements = useMemo(
    () => selectInventoryMovements(catalog),
    [catalog],
  );
  const inventoryAdjustments = useMemo(
    () => selectInventoryAdjustments(catalog),
    [catalog],
  );

  return {
    catalog,
    inventoryBatches,
    inventoryMovements,
    inventoryAdjustments,
    isLoading:
      inventoryBatchesQuery.isLoading ||
      inventoryMovementsQuery.isLoading ||
      inventoryAdjustmentsQuery.isLoading,
    isFetching:
      inventoryBatchesQuery.isFetching ||
      inventoryMovementsQuery.isFetching ||
      inventoryAdjustmentsQuery.isFetching,
  };
}

export function useInventoryMutations() {
  return {
    createInventoryBatch: useCreateInventoryBatchMutation(),
    updateInventoryBatch: useUpdateInventoryBatchMutation(),
    deleteInventoryBatch: useDeleteInventoryBatchMutation(),
    createInventoryMovement: useCreateInventoryMovementMutation(),
    updateInventoryMovement: useUpdateInventoryMovementMutation(),
    deleteInventoryMovement: useDeleteInventoryMovementMutation(),
    createInventoryAdjustment: useCreateInventoryAdjustmentMutation(),
    updateInventoryAdjustment: useUpdateInventoryAdjustmentMutation(),
    deleteInventoryAdjustment: useDeleteInventoryAdjustmentMutation(),
  };
}
