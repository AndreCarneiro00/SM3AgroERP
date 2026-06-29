import { selectAll, selectById } from '../../../core/collections/selectors';
import type {
  Counterparty,
  CounterpartyRow,
  MasterDataCatalog,
} from '../model/entities';

export function selectCounterpartyTypes(catalog: MasterDataCatalog) {
  return selectAll(catalog.counterpartyTypes);
}

export function selectSegments(catalog: MasterDataCatalog) {
  return selectAll(catalog.segments);
}

export function selectActivityGroups(catalog: MasterDataCatalog) {
  return selectAll(catalog.activityGroups);
}

export function selectDocumentTypes(catalog: MasterDataCatalog) {
  return selectAll(catalog.documentTypes);
}

export function selectAdjustmentRootCauses(catalog: MasterDataCatalog) {
  return selectAll(catalog.adjustmentRootCauses);
}

export function selectCounterparties(catalog: MasterDataCatalog) {
  return selectAll(catalog.counterparties);
}

export function selectCounterpartyDisplayName(
  counterparty?: Partial<Counterparty>,
) {
  if (!counterparty) return '-';
  return counterparty.tradeName?.trim() || counterparty.legalName?.trim() || '-';
}

export function selectCounterpartyLabelById(
  catalog: MasterDataCatalog,
  counterpartyId?: number,
) {
  return selectCounterpartyDisplayName(
    selectById(catalog.counterparties, counterpartyId),
  );
}

export function selectCounterpartyTypeLabelById(
  catalog: MasterDataCatalog,
  counterpartyTypeId?: number,
) {
  return selectById(catalog.counterpartyTypes, counterpartyTypeId)?.name ?? '-';
}

export function selectSegmentLabelById(
  catalog: MasterDataCatalog,
  segmentId?: number,
) {
  return selectById(catalog.segments, segmentId)?.name ?? '-';
}

export function selectActivityGroupLabelById(
  catalog: MasterDataCatalog,
  activityGroupId?: number,
) {
  return selectById(catalog.activityGroups, activityGroupId)?.name ?? '-';
}

export function selectDocumentTypeLabelById(
  catalog: MasterDataCatalog,
  documentTypeId?: number,
) {
  return selectById(catalog.documentTypes, documentTypeId)?.name ?? '-';
}

export function selectAdjustmentRootCauseLabelById(
  catalog: MasterDataCatalog,
  adjustmentRootCauseId?: number,
) {
  return (
    selectById(catalog.adjustmentRootCauses, adjustmentRootCauseId)?.name ?? '-'
  );
}

export function selectCounterpartyRows(
  catalog: MasterDataCatalog,
): CounterpartyRow[] {
  return selectCounterparties(catalog).map((counterparty) => ({
    ...counterparty,
    displayName: selectCounterpartyDisplayName(counterparty),
    counterpartyTypeName: selectCounterpartyTypeLabelById(
      catalog,
      counterparty.counterpartyTypeId,
    ),
    segmentName: selectSegmentLabelById(catalog, counterparty.segmentId),
  }));
}
