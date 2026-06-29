export const accountingKeys = {
  all: ['accounting'] as const,
  chartOfAccounts: () => [...accountingKeys.all, 'chart-of-accounts'] as const,
  costCenters: () => [...accountingKeys.all, 'cost-centers'] as const,
  incomeStatementGroups: () =>
    [...accountingKeys.all, 'income-statement-groups'] as const,
  incomeStatementRelationships: () =>
    [...accountingKeys.all, 'income-statement-relationships'] as const,
};
