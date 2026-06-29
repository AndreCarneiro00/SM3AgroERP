import { normalizeById } from '../../../core/collections/normalize';
import type {
  ChartOfAccountDto,
  CostCenterDto,
  CreateChartOfAccountDto,
  CreateCostCenterDto,
  CreateIncomeStatementGroupDto,
  CreateIncomeStatementRelationshipDto,
  IncomeStatementGroupDto,
  IncomeStatementRelationshipDto,
} from '../api/dtos';
import type {
  AccountingCatalog,
  ChartOfAccount,
  ChartOfAccountInput,
  CostCenter,
  CostCenterInput,
  IncomeStatementGroup,
  IncomeStatementGroupInput,
  IncomeStatementRelationship,
  IncomeStatementRelationshipInput,
} from './entities';

export function mapChartOfAccountDto(dto: ChartOfAccountDto): ChartOfAccount {
  return {
    id: dto.id,
    name: dto.name,
    parentId: dto.parentId,
    type: dto.type,
    acceptsTransaction: dto.acceptsTransaction ?? false,
    active: dto.active,
    code: dto.code,
  };
}

export function mapCostCenterDto(dto: CostCenterDto): CostCenter {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    type: dto.type,
    acceptsTransaction: dto.acceptsTransaction ?? false,
    active: dto.active,
    parentId: dto.parentId,
    code: dto.code,
    activityGroupId: dto.activityGroupId,
  };
}

export function mapIncomeStatementGroupDto(
  dto: IncomeStatementGroupDto,
): IncomeStatementGroup {
  return {
    id: dto.id,
    name: dto.name,
    displayOrder: dto.displayOrder,
  };
}

export function mapIncomeStatementRelationshipDto(
  dto: IncomeStatementRelationshipDto,
): IncomeStatementRelationship {
  return {
    id: dto.id,
    chartOfAccountId: dto.chartOfAccountId,
    incomeStatementGroupId: dto.incomeStatementGroupId,
  };
}

export function mapChartOfAccountInputToDto(
  input: ChartOfAccountInput,
): CreateChartOfAccountDto {
  return {
    name: input.name,
    parentId: input.parentId,
    type: input.type,
    acceptsTransaction: input.acceptsTransaction,
    active: input.active,
    code: input.code,
  };
}

export function mapCostCenterInputToDto(
  input: CostCenterInput,
): CreateCostCenterDto {
  return {
    name: input.name,
    description: input.description,
    type: input.type,
    acceptsTransaction: input.acceptsTransaction,
    active: input.active,
    parentId: input.parentId,
    code: input.code,
    activityGroupId: input.activityGroupId,
  };
}

export function mapIncomeStatementGroupInputToDto(
  input: IncomeStatementGroupInput,
): CreateIncomeStatementGroupDto {
  return {
    name: input.name,
    displayOrder: input.displayOrder,
  };
}

export function mapIncomeStatementRelationshipInputToDto(
  input: IncomeStatementRelationshipInput,
): CreateIncomeStatementRelationshipDto {
  return {
    chartOfAccountId: input.chartOfAccountId,
    incomeStatementGroupId: input.incomeStatementGroupId,
  };
}

export function createAccountingCatalog(params: {
  chartOfAccounts: ChartOfAccountDto[];
  costCenters: CostCenterDto[];
  incomeStatementGroups: IncomeStatementGroupDto[];
  incomeStatementRelationships: IncomeStatementRelationshipDto[];
}): AccountingCatalog {
  const chartOfAccounts = params.chartOfAccounts.map(mapChartOfAccountDto);
  const costCenters = params.costCenters.map(mapCostCenterDto);
  const incomeStatementGroups = params.incomeStatementGroups.map(
    mapIncomeStatementGroupDto,
  );
  const incomeStatementRelationships = params.incomeStatementRelationships.map(
    mapIncomeStatementRelationshipDto,
  );

  return {
    chartOfAccounts: normalizeById(chartOfAccounts),
    costCenters: normalizeById(costCenters),
    incomeStatementGroups: normalizeById(incomeStatementGroups),
    incomeStatementRelationships: normalizeById(incomeStatementRelationships),
  };
}
