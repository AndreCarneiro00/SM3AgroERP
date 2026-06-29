import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  ChartOfAccountDto,
  CostCenterDto,
  CreateChartOfAccountDto,
  CreateCostCenterDto,
  CreateIncomeStatementGroupDto,
  CreateIncomeStatementRelationshipDto,
  IncomeStatementGroupDto,
  IncomeStatementRelationshipDto,
  UpdateChartOfAccountDto,
  UpdateCostCenterDto,
  UpdateIncomeStatementGroupDto,
  UpdateIncomeStatementRelationshipDto,
} from './dtos';

const CHART_OF_ACCOUNTS_API_BASE = {
  mock: '/api/chart-of-accounts',
  api: '/chart-of-account',
} as const;
const COST_CENTERS_API_BASE = {
  mock: '/api/cost-centers',
  api: '/cost-center',
} as const;
const INCOME_STATEMENT_GROUPS_API_BASE = {
  mock: '/api/income-statement-groups',
  api: '/income-statement-group',
} as const;
const INCOME_STATEMENT_RELATIONSHIPS_API_BASE = {
  mock: '/api/income-statement-relationships',
  api: '/income-statement-relationships',
} as const;

export const accountingRepository = {
  listChartOfAccounts: () =>
    httpListRequest<ChartOfAccountDto>(resolveResourcePath(CHART_OF_ACCOUNTS_API_BASE)),
  createChartOfAccount: (payload: CreateChartOfAccountDto) =>
    httpRequest<ChartOfAccountDto>(resolveResourcePath(CHART_OF_ACCOUNTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateChartOfAccount: (id: number, payload: UpdateChartOfAccountDto) =>
    httpRequest<ChartOfAccountDto>(
      resolveResourceItemPath(CHART_OF_ACCOUNTS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteChartOfAccount: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(CHART_OF_ACCOUNTS_API_BASE, id), {
      method: 'DELETE',
    }),

  listCostCenters: () =>
    httpListRequest<CostCenterDto>(resolveResourcePath(COST_CENTERS_API_BASE)),
  createCostCenter: (payload: CreateCostCenterDto) =>
    httpRequest<CostCenterDto>(resolveResourcePath(COST_CENTERS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateCostCenter: (id: number, payload: UpdateCostCenterDto) =>
    httpRequest<CostCenterDto>(
      resolveResourceItemPath(COST_CENTERS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteCostCenter: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(COST_CENTERS_API_BASE, id), {
      method: 'DELETE',
    }),

  listIncomeStatementGroups: () =>
    httpListRequest<IncomeStatementGroupDto>(
      resolveResourcePath(INCOME_STATEMENT_GROUPS_API_BASE),
    ),
  createIncomeStatementGroup: (payload: CreateIncomeStatementGroupDto) =>
    httpRequest<IncomeStatementGroupDto>(
      resolveResourcePath(INCOME_STATEMENT_GROUPS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateIncomeStatementGroup: (
    id: number,
    payload: UpdateIncomeStatementGroupDto,
  ) =>
    httpRequest<IncomeStatementGroupDto>(
      resolveResourceItemPath(INCOME_STATEMENT_GROUPS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteIncomeStatementGroup: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(INCOME_STATEMENT_GROUPS_API_BASE, id), {
      method: 'DELETE',
    }),

  listIncomeStatementRelationships: () =>
    httpListRequest<IncomeStatementRelationshipDto>(
      resolveResourcePath(INCOME_STATEMENT_RELATIONSHIPS_API_BASE),
    ),
  createIncomeStatementRelationship: (
    payload: CreateIncomeStatementRelationshipDto,
  ) =>
    httpRequest<IncomeStatementRelationshipDto>(
      resolveResourcePath(INCOME_STATEMENT_RELATIONSHIPS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateIncomeStatementRelationship: (
    id: number,
    payload: UpdateIncomeStatementRelationshipDto,
  ) =>
    httpRequest<IncomeStatementRelationshipDto>(
      resolveResourceItemPath(INCOME_STATEMENT_RELATIONSHIPS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteIncomeStatementRelationship: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(INCOME_STATEMENT_RELATIONSHIPS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),
};
