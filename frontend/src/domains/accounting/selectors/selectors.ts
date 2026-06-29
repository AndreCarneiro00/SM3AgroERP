import { selectAll, selectById } from '../../../core/collections/selectors';
import type {
  AccountingCatalog,
  ChartOfAccount,
  CostCenter,
  IncomeStatementRelationshipRow,
} from '../model/entities';

export function selectChartOfAccounts(catalog: AccountingCatalog) {
  return selectAll(catalog.chartOfAccounts);
}

export function selectCostCenters(catalog: AccountingCatalog) {
  return selectAll(catalog.costCenters);
}

export function selectIncomeStatementGroups(catalog: AccountingCatalog) {
  return [...selectAll(catalog.incomeStatementGroups)].sort(
    (left, right) =>
      (left.displayOrder ?? Number.MAX_SAFE_INTEGER) -
        (right.displayOrder ?? Number.MAX_SAFE_INTEGER) ||
      left.name.localeCompare(right.name),
  );
}

export function selectIncomeStatementRelationships(catalog: AccountingCatalog) {
  return selectAll(catalog.incomeStatementRelationships);
}

export function selectChartOfAccountDisplayName(
  chartOfAccount?: Partial<ChartOfAccount>,
) {
  if (!chartOfAccount) return '-';
  return chartOfAccount.code
    ? `${chartOfAccount.code} - ${chartOfAccount.name}`
    : chartOfAccount.name ?? '-';
}

export function selectCostCenterDisplayName(costCenter?: Partial<CostCenter>) {
  if (!costCenter) return '-';
  return costCenter.code
    ? `${costCenter.code} - ${costCenter.name}`
    : costCenter.name ?? '-';
}

export function selectChartOfAccountLabelById(
  catalog: AccountingCatalog,
  chartOfAccountId?: number,
) {
  return selectChartOfAccountDisplayName(
    selectById(catalog.chartOfAccounts, chartOfAccountId),
  );
}

export function selectCostCenterLabelById(
  catalog: AccountingCatalog,
  costCenterId?: number,
) {
  return selectCostCenterDisplayName(
    selectById(catalog.costCenters, costCenterId),
  );
}

export function selectIncomeStatementGroupLabelById(
  catalog: AccountingCatalog,
  incomeStatementGroupId?: number,
) {
  return (
    selectById(catalog.incomeStatementGroups, incomeStatementGroupId)?.name ??
    '-'
  );
}

export function selectPostableChartOfAccounts(catalog: AccountingCatalog) {
  return selectChartOfAccounts(catalog).filter(
    (chartOfAccount) => chartOfAccount.acceptsTransaction,
  );
}

export function selectPostableCostCenters(catalog: AccountingCatalog) {
  return selectCostCenters(catalog).filter(
    (costCenter) => costCenter.acceptsTransaction,
  );
}

export function selectIncomeStatementRelationshipRows(
  catalog: AccountingCatalog,
): IncomeStatementRelationshipRow[] {
  return selectIncomeStatementRelationships(catalog).map((relationship) => ({
    ...relationship,
    chartOfAccountName: selectChartOfAccountLabelById(
      catalog,
      relationship.chartOfAccountId,
    ),
    incomeStatementGroupName: selectIncomeStatementGroupLabelById(
      catalog,
      relationship.incomeStatementGroupId,
    ),
  }));
}
