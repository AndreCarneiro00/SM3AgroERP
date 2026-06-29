import { useMemo } from 'react';
import { createAgriculturalCatalog } from '../model/mappers';
import {
  useCreateCutMutation,
  useCreateFieldMutation,
  useCreateFieldOperationItemMutation,
  useCreateFieldOperationMachineMutation,
  useCreateFieldOperationMutation,
  useCreateMachineMutation,
  useCreateProductionBatchMutation,
  useDeleteCutMutation,
  useDeleteFieldMutation,
  useDeleteFieldOperationItemMutation,
  useDeleteFieldOperationMachineMutation,
  useDeleteFieldOperationMutation,
  useDeleteMachineMutation,
  useDeleteProductionBatchMutation,
  useUpdateCutMutation,
  useUpdateFieldMutation,
  useUpdateFieldOperationItemMutation,
  useUpdateFieldOperationMachineMutation,
  useUpdateFieldOperationMutation,
  useUpdateMachineMutation,
  useUpdateProductionBatchMutation,
} from '../queries/mutations';
import { useAgriculturalCatalogQueries } from '../queries/queries';
import {
  selectCuts,
  selectFieldOperationItems,
  selectFieldOperationMachines,
  selectFieldOperations,
  selectFields,
  selectMachines,
  selectProductionBatches,
} from '../selectors/selectors';

export function useAgriculturalCatalogData() {
  const {
    fieldsQuery,
    machinesQuery,
    cutsQuery,
    fieldOperationsQuery,
    fieldOperationMachinesQuery,
    fieldOperationItemsQuery,
    productionBatchesQuery,
  } = useAgriculturalCatalogQueries();

  const catalog = useMemo(
    () =>
      createAgriculturalCatalog({
        fields: fieldsQuery.data ?? [],
        machines: machinesQuery.data ?? [],
        cuts: cutsQuery.data ?? [],
        fieldOperations: fieldOperationsQuery.data ?? [],
        fieldOperationMachines: fieldOperationMachinesQuery.data ?? [],
        fieldOperationItems: fieldOperationItemsQuery.data ?? [],
        productionBatches: productionBatchesQuery.data ?? [],
      }),
    [
      fieldsQuery.data,
      machinesQuery.data,
      cutsQuery.data,
      fieldOperationsQuery.data,
      fieldOperationMachinesQuery.data,
      fieldOperationItemsQuery.data,
      productionBatchesQuery.data,
    ],
  );

  const fields = useMemo(() => selectFields(catalog), [catalog]);
  const machines = useMemo(() => selectMachines(catalog), [catalog]);
  const cuts = useMemo(() => selectCuts(catalog), [catalog]);
  const fieldOperations = useMemo(
    () => selectFieldOperations(catalog),
    [catalog],
  );
  const fieldOperationMachines = useMemo(
    () => selectFieldOperationMachines(catalog),
    [catalog],
  );
  const fieldOperationItems = useMemo(
    () => selectFieldOperationItems(catalog),
    [catalog],
  );
  const productionBatches = useMemo(
    () => selectProductionBatches(catalog),
    [catalog],
  );

  return {
    catalog,
    fields,
    machines,
    cuts,
    fieldOperations,
    fieldOperationMachines,
    fieldOperationItems,
    productionBatches,
    isLoading:
      fieldsQuery.isLoading ||
      machinesQuery.isLoading ||
      cutsQuery.isLoading ||
      fieldOperationsQuery.isLoading ||
      fieldOperationMachinesQuery.isLoading ||
      fieldOperationItemsQuery.isLoading ||
      productionBatchesQuery.isLoading,
    isFetching:
      fieldsQuery.isFetching ||
      machinesQuery.isFetching ||
      cutsQuery.isFetching ||
      fieldOperationsQuery.isFetching ||
      fieldOperationMachinesQuery.isFetching ||
      fieldOperationItemsQuery.isFetching ||
      productionBatchesQuery.isFetching,
  };
}

export function useAgriculturalMutations() {
  return {
    createField: useCreateFieldMutation(),
    updateField: useUpdateFieldMutation(),
    deleteField: useDeleteFieldMutation(),
    createMachine: useCreateMachineMutation(),
    updateMachine: useUpdateMachineMutation(),
    deleteMachine: useDeleteMachineMutation(),
    createCut: useCreateCutMutation(),
    updateCut: useUpdateCutMutation(),
    deleteCut: useDeleteCutMutation(),
    createFieldOperation: useCreateFieldOperationMutation(),
    updateFieldOperation: useUpdateFieldOperationMutation(),
    deleteFieldOperation: useDeleteFieldOperationMutation(),
    createFieldOperationMachine: useCreateFieldOperationMachineMutation(),
    updateFieldOperationMachine: useUpdateFieldOperationMachineMutation(),
    deleteFieldOperationMachine: useDeleteFieldOperationMachineMutation(),
    createFieldOperationItem: useCreateFieldOperationItemMutation(),
    updateFieldOperationItem: useUpdateFieldOperationItemMutation(),
    deleteFieldOperationItem: useDeleteFieldOperationItemMutation(),
    createProductionBatch: useCreateProductionBatchMutation(),
    updateProductionBatch: useUpdateProductionBatchMutation(),
    deleteProductionBatch: useDeleteProductionBatchMutation(),
  };
}
