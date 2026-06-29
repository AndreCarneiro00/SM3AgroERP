import { useMemo } from 'react';
import { createMasterDataCatalog } from '../model/mappers';
import {
  selectActivityGroups,
  selectAdjustmentRootCauses,
  selectCounterparties,
  selectCounterpartyRows,
  selectCounterpartyTypes,
  selectDocumentTypes,
  selectSegments,
} from '../selectors/selectors';
import {
  useCreateActivityGroupMutation,
  useCreateAdjustmentRootCauseMutation,
  useCreateCounterpartyMutation,
  useCreateCounterpartyTypeMutation,
  useCreateDocumentTypeMutation,
  useCreateSegmentMutation,
  useDeleteActivityGroupMutation,
  useDeleteAdjustmentRootCauseMutation,
  useDeleteCounterpartyMutation,
  useDeleteCounterpartyTypeMutation,
  useDeleteDocumentTypeMutation,
  useDeleteSegmentMutation,
  useUpdateActivityGroupMutation,
  useUpdateAdjustmentRootCauseMutation,
  useUpdateCounterpartyMutation,
  useUpdateCounterpartyTypeMutation,
  useUpdateDocumentTypeMutation,
  useUpdateSegmentMutation,
} from '../queries/mutations';
import { useMasterDataCatalogQueries } from '../queries/queries';

export function useMasterDataCatalogData() {
  const {
    counterpartyTypesQuery,
    segmentsQuery,
    activityGroupsQuery,
    documentTypesQuery,
    adjustmentRootCausesQuery,
    counterpartiesQuery,
  } = useMasterDataCatalogQueries();

  const catalog = useMemo(
    () =>
      createMasterDataCatalog({
        counterpartyTypes: counterpartyTypesQuery.data ?? [],
        segments: segmentsQuery.data ?? [],
        activityGroups: activityGroupsQuery.data ?? [],
        documentTypes: documentTypesQuery.data ?? [],
        adjustmentRootCauses: adjustmentRootCausesQuery.data ?? [],
        counterparties: counterpartiesQuery.data ?? [],
      }),
    [
      counterpartyTypesQuery.data,
      segmentsQuery.data,
      activityGroupsQuery.data,
      documentTypesQuery.data,
      adjustmentRootCausesQuery.data,
      counterpartiesQuery.data,
    ],
  );

  const counterpartyTypes = useMemo(
    () => selectCounterpartyTypes(catalog),
    [catalog],
  );
  const segments = useMemo(() => selectSegments(catalog), [catalog]);
  const activityGroups = useMemo(() => selectActivityGroups(catalog), [catalog]);
  const documentTypes = useMemo(() => selectDocumentTypes(catalog), [catalog]);
  const adjustmentRootCauses = useMemo(
    () => selectAdjustmentRootCauses(catalog),
    [catalog],
  );
  const counterparties = useMemo(() => selectCounterparties(catalog), [catalog]);
  const counterpartyRows = useMemo(
    () => selectCounterpartyRows(catalog),
    [catalog],
  );

  return {
    catalog,
    counterpartyTypes,
    segments,
    activityGroups,
    documentTypes,
    adjustmentRootCauses,
    counterparties,
    counterpartyRows,
    isLoading:
      counterpartyTypesQuery.isLoading ||
      segmentsQuery.isLoading ||
      activityGroupsQuery.isLoading ||
      documentTypesQuery.isLoading ||
      adjustmentRootCausesQuery.isLoading ||
      counterpartiesQuery.isLoading,
    isFetching:
      counterpartyTypesQuery.isFetching ||
      segmentsQuery.isFetching ||
      activityGroupsQuery.isFetching ||
      documentTypesQuery.isFetching ||
      adjustmentRootCausesQuery.isFetching ||
      counterpartiesQuery.isFetching,
  };
}

export function useMasterDataMutations() {
  return {
    createCounterpartyType: useCreateCounterpartyTypeMutation(),
    updateCounterpartyType: useUpdateCounterpartyTypeMutation(),
    deleteCounterpartyType: useDeleteCounterpartyTypeMutation(),
    createSegment: useCreateSegmentMutation(),
    updateSegment: useUpdateSegmentMutation(),
    deleteSegment: useDeleteSegmentMutation(),
    createActivityGroup: useCreateActivityGroupMutation(),
    updateActivityGroup: useUpdateActivityGroupMutation(),
    deleteActivityGroup: useDeleteActivityGroupMutation(),
    createDocumentType: useCreateDocumentTypeMutation(),
    updateDocumentType: useUpdateDocumentTypeMutation(),
    deleteDocumentType: useDeleteDocumentTypeMutation(),
    createAdjustmentRootCause: useCreateAdjustmentRootCauseMutation(),
    updateAdjustmentRootCause: useUpdateAdjustmentRootCauseMutation(),
    deleteAdjustmentRootCause: useDeleteAdjustmentRootCauseMutation(),
    createCounterparty: useCreateCounterpartyMutation(),
    updateCounterparty: useUpdateCounterpartyMutation(),
    deleteCounterparty: useDeleteCounterpartyMutation(),
  };
}
