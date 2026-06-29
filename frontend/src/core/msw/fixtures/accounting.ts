import chartOfAccountsJson from '../../../app/data/json/chartOfAccounts.json';
import costCentersJson from '../../../app/data/json/costCenters.json';
import incomeStatementGroupsJson from '../../../app/data/json/incomeStatementGroups.json';
import incomeStatementRelationshipsJson from '../../../app/data/json/incomeStatementRelationships.json';
import type {
  ChartOfAccountDto,
  CostCenterDto,
  IncomeStatementGroupDto,
  IncomeStatementRelationshipDto,
} from '../../../domains/accounting/api/dtos';

export function createAccountingFixtures() {
  return {
    chartOfAccounts: structuredClone(chartOfAccountsJson) as ChartOfAccountDto[],
    costCenters: structuredClone(costCentersJson) as CostCenterDto[],
    incomeStatementGroups: structuredClone(
      incomeStatementGroupsJson,
    ) as IncomeStatementGroupDto[],
    incomeStatementRelationships: structuredClone(
      incomeStatementRelationshipsJson,
    ) as IncomeStatementRelationshipDto[],
  };
}
