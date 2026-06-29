import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  ChartOfAccountDto,
  CostCenterDto,
  CreateChartOfAccountDto,
  CreateCostCenterDto,
  CreateIncomeStatementGroupDto,
  CreateIncomeStatementRelationshipDto,
  IncomeStatementGroupDto,
  IncomeStatementRelationshipDto,
} from '../../../domains/accounting/api/dtos';
import { createAccountingFixtures } from '../fixtures/accounting';

const fixtures = createAccountingFixtures();

function nextId(items: Array<{ id: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function parseId(rawId?: string) {
  if (!rawId) return undefined;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function notFound() {
  return HttpResponse.json({ message: 'Not found' }, { status: 404 });
}

export const accountingHandlers: RequestHandler[] = [
  http.get(`/api/chart-of-accounts`, () => {
    return HttpResponse.json(fixtures.chartOfAccounts);
  }),
  http.post(`/api/chart-of-accounts`, async ({ request }) => {
    const payload = (await request.json()) as CreateChartOfAccountDto;
    const created: ChartOfAccountDto = {
      id: nextId(fixtures.chartOfAccounts),
      name: payload.name,
      parentId: payload.parentId,
      type: payload.type,
      acceptsTransaction: payload.acceptsTransaction,
      active: payload.active,
      code: payload.code,
    };
    fixtures.chartOfAccounts.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/chart-of-accounts/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateChartOfAccountDto;
      const index = fixtures.chartOfAccounts.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.chartOfAccounts[index] = {
        ...fixtures.chartOfAccounts[index],
        name: payload.name,
        parentId: payload.parentId,
        type: payload.type,
        acceptsTransaction: payload.acceptsTransaction,
        active: payload.active,
        code: payload.code,
      };

      return HttpResponse.json(fixtures.chartOfAccounts[index]);
    },
  ),
  http.delete(`/api/chart-of-accounts/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.chartOfAccounts = fixtures.chartOfAccounts.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/cost-centers`, () => {
    return HttpResponse.json(fixtures.costCenters);
  }),
  http.post(`/api/cost-centers`, async ({ request }) => {
    const payload = (await request.json()) as CreateCostCenterDto;
    const created: CostCenterDto = {
      id: nextId(fixtures.costCenters),
      name: payload.name,
      description: payload.description,
      type: payload.type,
      acceptsTransaction: payload.acceptsTransaction,
      active: payload.active,
      parentId: payload.parentId,
      code: payload.code,
      activityGroupId: payload.activityGroupId,
    };
    fixtures.costCenters.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/cost-centers/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateCostCenterDto;
      const index = fixtures.costCenters.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.costCenters[index] = {
        ...fixtures.costCenters[index],
        name: payload.name,
        description: payload.description,
        type: payload.type,
        acceptsTransaction: payload.acceptsTransaction,
        active: payload.active,
        parentId: payload.parentId,
        code: payload.code,
        activityGroupId: payload.activityGroupId,
      };

      return HttpResponse.json(fixtures.costCenters[index]);
    },
  ),
  http.delete(`/api/cost-centers/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.costCenters = fixtures.costCenters.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/income-statement-groups`, () => {
    return HttpResponse.json(fixtures.incomeStatementGroups);
  }),
  http.post(
    `/api/income-statement-groups`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateIncomeStatementGroupDto;
      const created: IncomeStatementGroupDto = {
        id: nextId(fixtures.incomeStatementGroups),
        name: payload.name,
        displayOrder: payload.displayOrder,
      };
      fixtures.incomeStatementGroups.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/income-statement-groups/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateIncomeStatementGroupDto;
      const index = fixtures.incomeStatementGroups.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.incomeStatementGroups[index] = {
        ...fixtures.incomeStatementGroups[index],
        name: payload.name,
        displayOrder: payload.displayOrder,
      };

      return HttpResponse.json(fixtures.incomeStatementGroups[index]);
    },
  ),
  http.delete(
    `/api/income-statement-groups/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.incomeStatementGroups = fixtures.incomeStatementGroups.filter(
        (item) => item.id !== id,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/income-statement-relationships`, () => {
    return HttpResponse.json(fixtures.incomeStatementRelationships);
  }),
  http.post(
    `/api/income-statement-relationships`,
    async ({ request }) => {
      const payload =
        (await request.json()) as CreateIncomeStatementRelationshipDto;
      const created: IncomeStatementRelationshipDto = {
        id: nextId(fixtures.incomeStatementRelationships),
        chartOfAccountId: payload.chartOfAccountId,
        incomeStatementGroupId: payload.incomeStatementGroupId,
      };
      fixtures.incomeStatementRelationships.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/income-statement-relationships/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload =
        (await request.json()) as CreateIncomeStatementRelationshipDto;
      const index = fixtures.incomeStatementRelationships.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.incomeStatementRelationships[index] = {
        ...fixtures.incomeStatementRelationships[index],
        chartOfAccountId: payload.chartOfAccountId,
        incomeStatementGroupId: payload.incomeStatementGroupId,
      };

      return HttpResponse.json(fixtures.incomeStatementRelationships[index]);
    },
  ),
  http.delete(
    `/api/income-statement-relationships/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.incomeStatementRelationships =
        fixtures.incomeStatementRelationships.filter((item) => item.id !== id);
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
