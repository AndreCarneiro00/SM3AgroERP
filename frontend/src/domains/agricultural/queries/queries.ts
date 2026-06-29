import { useQueries, useQuery } from '@tanstack/react-query';
import { agriculturalRepository } from '../api/repository';
import { agriculturalKeys } from './keys';

export function useFieldsQuery() {
  return useQuery({
    queryKey: agriculturalKeys.fields(),
    queryFn: agriculturalRepository.listFields,
  });
}

export function useMachinesQuery() {
  return useQuery({
    queryKey: agriculturalKeys.machines(),
    queryFn: agriculturalRepository.listMachines,
  });
}

export function useCutsQuery() {
  return useQuery({
    queryKey: agriculturalKeys.cuts(),
    queryFn: agriculturalRepository.listCuts,
  });
}

export function useFieldOperationsQuery() {
  return useQuery({
    queryKey: agriculturalKeys.fieldOperations(),
    queryFn: agriculturalRepository.listFieldOperations,
  });
}

export function useFieldOperationMachinesQuery() {
  return useQuery({
    queryKey: agriculturalKeys.fieldOperationMachines(),
    queryFn: agriculturalRepository.listFieldOperationMachines,
  });
}

export function useFieldOperationItemsQuery() {
  return useQuery({
    queryKey: agriculturalKeys.fieldOperationItems(),
    queryFn: agriculturalRepository.listFieldOperationItems,
  });
}

export function useProductionBatchesQuery() {
  return useQuery({
    queryKey: agriculturalKeys.productionBatches(),
    queryFn: agriculturalRepository.listProductionBatches,
  });
}

export function useAgriculturalCatalogQueries() {
  const [
    fieldsQuery,
    machinesQuery,
    cutsQuery,
    fieldOperationsQuery,
    fieldOperationMachinesQuery,
    fieldOperationItemsQuery,
    productionBatchesQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: agriculturalKeys.fields(),
        queryFn: agriculturalRepository.listFields,
      },
      {
        queryKey: agriculturalKeys.machines(),
        queryFn: agriculturalRepository.listMachines,
      },
      {
        queryKey: agriculturalKeys.cuts(),
        queryFn: agriculturalRepository.listCuts,
      },
      {
        queryKey: agriculturalKeys.fieldOperations(),
        queryFn: agriculturalRepository.listFieldOperations,
      },
      {
        queryKey: agriculturalKeys.fieldOperationMachines(),
        queryFn: agriculturalRepository.listFieldOperationMachines,
      },
      {
        queryKey: agriculturalKeys.fieldOperationItems(),
        queryFn: agriculturalRepository.listFieldOperationItems,
      },
      {
        queryKey: agriculturalKeys.productionBatches(),
        queryFn: agriculturalRepository.listProductionBatches,
      },
    ],
  });

  return {
    fieldsQuery,
    machinesQuery,
    cutsQuery,
    fieldOperationsQuery,
    fieldOperationMachinesQuery,
    fieldOperationItemsQuery,
    productionBatchesQuery,
  };
}
