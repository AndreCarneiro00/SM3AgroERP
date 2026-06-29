import { useQueries, useQuery } from '@tanstack/react-query';
import { masterDataRepository } from '../api/repository';
import { masterDataKeys } from './keys';

export function useCounterpartyTypesQuery() {
  return useQuery({
    queryKey: masterDataKeys.counterpartyTypes(),
    queryFn: masterDataRepository.listCounterpartyTypes,
  });
}

export function useSegmentsQuery() {
  return useQuery({
    queryKey: masterDataKeys.segments(),
    queryFn: masterDataRepository.listSegments,
  });
}

export function useActivityGroupsQuery() {
  return useQuery({
    queryKey: masterDataKeys.activityGroups(),
    queryFn: masterDataRepository.listActivityGroups,
  });
}

export function useDocumentTypesQuery() {
  return useQuery({
    queryKey: masterDataKeys.documentTypes(),
    queryFn: masterDataRepository.listDocumentTypes,
  });
}

export function useAdjustmentRootCausesQuery() {
  return useQuery({
    queryKey: masterDataKeys.adjustmentRootCauses(),
    queryFn: masterDataRepository.listAdjustmentRootCauses,
  });
}

export function useCounterpartiesQuery() {
  return useQuery({
    queryKey: masterDataKeys.counterparties(),
    queryFn: masterDataRepository.listCounterparties,
  });
}

export function useMasterDataCatalogQueries() {
  const [
    counterpartyTypesQuery,
    segmentsQuery,
    activityGroupsQuery,
    documentTypesQuery,
    adjustmentRootCausesQuery,
    counterpartiesQuery,
  ] = useQueries({
    queries: [
      {
        queryKey: masterDataKeys.counterpartyTypes(),
        queryFn: masterDataRepository.listCounterpartyTypes,
      },
      {
        queryKey: masterDataKeys.segments(),
        queryFn: masterDataRepository.listSegments,
      },
      {
        queryKey: masterDataKeys.activityGroups(),
        queryFn: masterDataRepository.listActivityGroups,
      },
      {
        queryKey: masterDataKeys.documentTypes(),
        queryFn: masterDataRepository.listDocumentTypes,
      },
      {
        queryKey: masterDataKeys.adjustmentRootCauses(),
        queryFn: masterDataRepository.listAdjustmentRootCauses,
      },
      {
        queryKey: masterDataKeys.counterparties(),
        queryFn: masterDataRepository.listCounterparties,
      },
    ],
  });

  return {
    counterpartyTypesQuery,
    segmentsQuery,
    activityGroupsQuery,
    documentTypesQuery,
    adjustmentRootCausesQuery,
    counterpartiesQuery,
  };
}
