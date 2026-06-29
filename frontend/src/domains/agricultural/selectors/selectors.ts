import { selectAll, selectById } from '../../../core/collections/selectors';
import type {
  AgriculturalCatalog,
  Cut,
  Field,
  FieldOperation,
  Machine,
  ProductionBatch,
} from '../model/entities';

export function selectFields(catalog: AgriculturalCatalog) {
  return selectAll(catalog.fields);
}

export function selectMachines(catalog: AgriculturalCatalog) {
  return selectAll(catalog.machines);
}

export function selectCuts(catalog: AgriculturalCatalog) {
  return selectAll(catalog.cuts);
}

export function selectFieldOperations(catalog: AgriculturalCatalog) {
  return selectAll(catalog.fieldOperations);
}

export function selectFieldOperationMachines(catalog: AgriculturalCatalog) {
  return selectAll(catalog.fieldOperationMachines);
}

export function selectFieldOperationItems(catalog: AgriculturalCatalog) {
  return selectAll(catalog.fieldOperationItems);
}

export function selectProductionBatches(catalog: AgriculturalCatalog) {
  return selectAll(catalog.productionBatches);
}

export function selectFieldDisplayName(field?: Partial<Field>) {
  if (!field) return '-';
  return field.name?.trim() || `#${field.id ?? '-'}`;
}

export function selectFieldLabelById(
  catalog: AgriculturalCatalog,
  fieldId?: number,
) {
  return selectFieldDisplayName(selectById(catalog.fields, fieldId));
}

export function selectMachineDisplayName(machine?: Partial<Machine>) {
  if (!machine) return '-';
  return machine.name?.trim() || `#${machine.id ?? '-'}`;
}

export function selectMachineLabelById(
  catalog: AgriculturalCatalog,
  machineId?: number,
) {
  return selectMachineDisplayName(selectById(catalog.machines, machineId));
}

export function selectCutDisplayName(
  catalog: AgriculturalCatalog,
  cut?: Partial<Cut>,
) {
  if (!cut) return '-';

  const fieldLabel = selectFieldLabelById(catalog, cut.fieldId);
  const cutLabel = cut.cutNumber ? `#${cut.cutNumber}` : `#${cut.id ?? '-'}`;

  if (fieldLabel === '-') return cutLabel;
  return `${fieldLabel} - ${cutLabel}`;
}

export function selectCutLabelById(
  catalog: AgriculturalCatalog,
  cutId?: number,
) {
  return selectCutDisplayName(catalog, selectById(catalog.cuts, cutId));
}

export function selectFieldOperationDisplayName(
  catalog: AgriculturalCatalog,
  fieldOperation?: Partial<FieldOperation>,
) {
  if (!fieldOperation) return '-';

  const fieldLabel = selectFieldLabelById(catalog, fieldOperation.fieldId);
  const operationType = fieldOperation.operationType ?? 'OPERATION';
  const operationDate = fieldOperation.operationDate ?? '-';

  return `${fieldLabel} - ${operationType} - ${operationDate}`;
}

export function selectFieldOperationLabelById(
  catalog: AgriculturalCatalog,
  fieldOperationId?: number,
) {
  return selectFieldOperationDisplayName(
    catalog,
    selectById(catalog.fieldOperations, fieldOperationId),
  );
}

export function selectProductionBatchDisplayName(
  productionBatch?: Partial<ProductionBatch>,
) {
  if (!productionBatch) return '-';
  return productionBatch.qualityGrade?.trim() || `#${productionBatch.id ?? '-'}`;
}
