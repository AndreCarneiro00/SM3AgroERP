export type ChartOfAccountType =
  | 'INCOME'
  | 'EXPENSE'
  | 'TRANSFER'
  | 'MANAGERIAL';

export type CostCenterType = 'CAPEX' | 'OPEX';

export interface ChartOfAccountDto {
  id: number;
  name: string;
  parentId?: number;
  type: ChartOfAccountType;
  acceptsTransaction?: boolean;
  active: boolean;
  code?: string;
}

export interface CostCenterDto {
  id: number;
  name: string;
  description?: string;
  type?: CostCenterType;
  acceptsTransaction?: boolean;
  active: boolean;
  parentId?: number;
  code?: string;
  activityGroupId?: number;
}

export interface IncomeStatementGroupDto {
  id: number;
  name: string;
  displayOrder?: number;
}

export interface IncomeStatementRelationshipDto {
  id: number;
  chartOfAccountId?: number;
  incomeStatementGroupId?: number;
}

export type CreateChartOfAccountDto = Omit<ChartOfAccountDto, 'id'>;
export type UpdateChartOfAccountDto = CreateChartOfAccountDto;

export type CreateCostCenterDto = Omit<CostCenterDto, 'id'>;
export type UpdateCostCenterDto = CreateCostCenterDto;

export type CreateIncomeStatementGroupDto = Omit<
  IncomeStatementGroupDto,
  'id'
>;
export type UpdateIncomeStatementGroupDto = CreateIncomeStatementGroupDto;

export type CreateIncomeStatementRelationshipDto = Omit<
  IncomeStatementRelationshipDto,
  'id'
>;
export type UpdateIncomeStatementRelationshipDto =
  CreateIncomeStatementRelationshipDto;
