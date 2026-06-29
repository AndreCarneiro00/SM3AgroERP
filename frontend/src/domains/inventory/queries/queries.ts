import { useQueries, useQuery } from '@tanstack/react-query';
import { inventoryRepository } from '../api/repository';
import { inventoryKeys } from './keys';

export function useInventoryBatchesQuery() {
  return useQuery({
    queryKey: inventoryKeys.inventoryBatches(),
    queryFn: inventoryRepository.listInventoryBatches,
  });
}

export function useInventoryMovementsQuery() {
  return useQuery({
    queryKey: inventoryKeys.inventoryMovements(),
    queryFn: inventoryRepository.listInventoryMovements,
  });
}

export function useInventoryAdjustmentsQuery() {
  return useQuery({
    queryKey: inventoryKeys.inventoryAdjustments(),
    queryFn: inventoryRepository.listInventoryAdjustments,
  });
}

export function useInventoryCatalogQueries() {
  const [
    inventoryBatchesQuery,
    inventoryMovementsQuery,
    inventoryAdjustmentsQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: inventoryKeys.inventoryBatches(),
        queryFn: inventoryRepository.listInventoryBatches,
      },
      {
        queryKey: inventoryKeys.inventoryMovements(),
        queryFn: inventoryRepository.listInventoryMovements,
      },
      {
        queryKey: inventoryKeys.inventoryAdjustments(),
        queryFn: inventoryRepository.listInventoryAdjustments,
      },
    ],
  });

  return {
    inventoryBatchesQuery,
    inventoryMovementsQuery,
    inventoryAdjustmentsQuery,
  };
}
