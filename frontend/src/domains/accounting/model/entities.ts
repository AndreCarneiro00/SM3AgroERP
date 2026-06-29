import type { EntityCollection } from '../../../core/collections/types';
import type {
  ChartOfAccountType,
  CostCenterType,
} from '../api/dtos';

export interface ChartOfAccount {
  id: number;
  name: string;
  parentId?: number;
  type: ChartOfAccountType;
  acceptsTransaction: boolean;
  active: boolean;
  code?: string;
}

export interface CostCenter {
  id: number;
  name: string;
  description?: string;
  type?: CostCenterType;
  acceptsTransaction: boolean;
  active: boolean;
  parentId?: number;
  code?: string;
  activityGroupId?: number;
}

export interface IncomeStatementGroup {
  id: number;
  name: string;
  displayOrder?: number;
}

export interface IncomeStatementRelationship {
  id: number;
  chartOfAccountId?: number;
  incomeStatementGroupId?: number;
}

export interface AccountingCatalog {
  chartOfAccounts: EntityCollection<ChartOfAccount>;
  costCenters: EntityCollection<CostCenter>;
  incomeStatementGroups: EntityCollection<IncomeStatementGroup>;
  incomeStatementRelationships: EntityCollection<IncomeStatementRelationship>;
}

export interface ChartOfAccountInput {
  name: string;
  parentId?: number;
  type: ChartOfAccountType;
  acceptsTransaction: boolean;
  active: boolean;
  code?: string;
}

export interface CostCenterInput {
  name: string;
  description?: string;
  type?: CostCenterType;
  acceptsTransaction: boolean;
  active: boolean;
  parentId?: number;
  code?: string;
  activityGroupId?: number;
}

export interface IncomeStatementGroupInput {
  name: string;
  displayOrder?: number;
}

export interface IncomeStatementRelationshipInput {
  chartOfAccountId?: number;
  incomeStatementGroupId?: number;
}

export interface IncomeStatementRelationshipRow
  extends IncomeStatementRelationship {
  chartOfAccountName: string;
  incomeStatementGroupName: string;
}
