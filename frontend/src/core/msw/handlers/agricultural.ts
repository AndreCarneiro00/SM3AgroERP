import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  CreateFieldDto,
  CreateFieldOperationDto,
  CreateFieldOperationItemDto,
  CreateFieldOperationMachineDto,
  CreateMachineDto,
  CreateProductionBatchDto,
  CutDto,
  FieldDto,
  FieldOperationDto,
  FieldOperationItemDto,
  FieldOperationMachineDto,
  LaunchCutDto,
  MachineDto,
  ProductionBatchDto,
} from '../../../domains/agricultural/api/dtos';
import { createAgriculturalFixtures } from '../fixtures/agricultural';
import { inventoryFixtures } from './inventory';
import { productFixtures } from './products';

const fixtures = createAgriculturalFixtures();
const MS_PER_DAY = 24 * 60 * 60 * 1000;

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

function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

function normalizeDate(value?: string) {
  return value?.split(/[T ]/)[0];
}

function dateToUtcTime(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function daysBetween(previousDate: string, cutDate: string) {
  return Math.round(
    (dateToUtcTime(cutDate) - dateToUtcTime(previousDate)) / MS_PER_DAY,
  );
}

function resolveCutNumber(fieldId?: number) {
  return (
    fixtures.cuts.filter(
      (cut) => cut.fieldId === fieldId && (cut.status ?? 'DONE') === 'DONE',
    ).length + 1
  );
}

function resolveDaysSinceLastCut(fieldId: number, cutDate: string) {
  const previousCut = fixtures.cuts
    .filter((cut) => {
      const previousDate = normalizeDate(cut.cutDate);
      return (
        cut.fieldId === fieldId &&
        (cut.status ?? 'DONE') === 'DONE' &&
        !!previousDate &&
        previousDate < cutDate
      );
    })
    .sort((left, right) => {
      const dateComparison = (normalizeDate(right.cutDate) ?? '').localeCompare(
        normalizeDate(left.cutDate) ?? '',
      );

      return dateComparison || right.id - left.id;
    })[0];

  const previousDate = normalizeDate(previousCut?.cutDate);
  return previousDate ? daysBetween(previousDate, cutDate) : undefined;
}

function createCrudHandlers<T extends { id: number }, TCreate>(
  path: string,
  options: {
    getItems: () => T[];
    setItems: (items: T[]) => void;
    createItem: (payload: TCreate, id: number) => T;
    updateItem: (current: T, payload: TCreate) => T;
  },
): RequestHandler[] {
  return [
    http.get(`${path}`, () => {
      return HttpResponse.json(options.getItems());
    }),
    http.post(`${path}`, async ({ request }) => {
      const payload = (await request.json()) as TCreate;
      const created = options.createItem(payload, nextId(options.getItems()));
      options.setItems([...options.getItems(), created]);
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(`${path}/:id`, async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as TCreate;
      const items = [...options.getItems()];
      const index = items.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      items[index] = options.updateItem(items[index], payload);
      options.setItems(items);

      return HttpResponse.json(items[index]);
    }),
    http.delete(`${path}/:id`, ({ params }) => {
      const id = parseId(String(params.id));
      options.setItems(options.getItems().filter((item) => item.id !== id));
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

export const agriculturalHandlers: RequestHandler[] = [
  ...createCrudHandlers<FieldDto, CreateFieldDto>('/api/fields', {
    getItems: () => fixtures.fields,
    setItems: (items) => {
      fixtures.fields = items;
    },
    createItem: (payload, id) => ({
      id,
      name: payload.name,
      areaHectares: payload.areaHectares,
    }),
    updateItem: (current, payload) => ({
      ...current,
      name: payload.name,
      areaHectares: payload.areaHectares,
    }),
  }),
  ...createCrudHandlers<MachineDto, CreateMachineDto>('/api/machines', {
    getItems: () => fixtures.machines,
    setItems: (items) => {
      fixtures.machines = items;
    },
    createItem: (payload, id) => ({
      id,
      name: payload.name,
      machineType: payload.machineType,
      manufacturer: payload.manufacturer,
      model: payload.model,
      year: payload.year,
      active: payload.active,
      observation: payload.observation,
    }),
    updateItem: (current, payload) => ({
      ...current,
      name: payload.name,
      machineType: payload.machineType,
      manufacturer: payload.manufacturer,
      model: payload.model,
      year: payload.year,
      active: payload.active,
      observation: payload.observation,
    }),
  }),
  http.get('/api/cuts', () => {
    return HttpResponse.json(fixtures.cuts);
  }),
  http.post('/api/cuts', async ({ request }) => {
    const payload = (await request.json()) as LaunchCutDto;
    const cutDate = normalizeDate(payload.cutDate);

    if (!payload.fieldId) return badRequest('fieldId is required');
    if (!payload.productId) return badRequest('productId is required');
    if (!cutDate) return badRequest('cutDate is required');
    if (!payload.quantity || payload.quantity <= 0) {
      return badRequest('quantity must be greater than zero');
    }
    if (payload.unitCost !== undefined && payload.unitCost < 0) {
      return badRequest('unitCost must be greater than or equal to zero');
    }

    const field = fixtures.fields.find((item) => item.id === payload.fieldId);
    if (!field) return notFound();

    const product = productFixtures.products.find(
      (item) => item.id === payload.productId,
    );
    if (!product) return notFound();
    if (product.hasStock !== true) {
      return badRequest('Product must control stock to launch a cut.');
    }
    if (!product.stockControlStartDate) {
      return badRequest(
        'stockControlStartDate is required for stock-controlled products.',
      );
    }
    if (cutDate < product.stockControlStartDate) {
      return badRequest('cutDate cannot be before product stockControlStartDate.');
    }

    const id = nextId(fixtures.cuts);
    const batchId = nextId(inventoryFixtures.inventoryBatches);
    const movementId = nextId(inventoryFixtures.inventoryMovements);
    const productionBatchId = nextId(fixtures.productionBatches);
    const batchCode = `PRD${payload.productId}-${cutDate.replace(/-/g, '')}-CUT${id}`;
    const created: CutDto = {
      id,
      fieldId: payload.fieldId,
      productId: payload.productId,
      inventoryBatchId: batchId,
      inventoryMovementId: movementId,
      productionBatchId,
      batchCode,
      cutDate,
      cutNumber: resolveCutNumber(payload.fieldId),
      status: 'DONE',
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      qualityGrade: payload.qualityGrade,
      observation: payload.observation,
      daysSinceLastCut: resolveDaysSinceLastCut(payload.fieldId, cutDate),
    };

    fixtures.cuts = [...fixtures.cuts, created];
    inventoryFixtures.inventoryBatches.push({
      id: batchId,
      productId: payload.productId,
      code: batchCode,
      batchDate: cutDate,
      status: 'ACTIVE',
      unitCost: payload.unitCost,
      quantity: payload.quantity,
    });
    inventoryFixtures.inventoryMovements.push({
      id: movementId,
      batchId,
      movementType: 'PRODUCTION_IN',
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      movementDate: cutDate,
    });
    fixtures.productionBatches.push({
      id: productionBatchId,
      inventoryBatchId: batchId,
      inventoryMovementId: movementId,
      quantity: payload.quantity,
      qualityGrade: payload.qualityGrade,
      cutId: id,
      observation: payload.observation,
    });

    return HttpResponse.json(created, { status: 201 });
  }),
  http.post('/api/cuts/:id/cancel', ({ params }) => {
    const id = parseId(String(params.id));
    const items = [...fixtures.cuts];
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    items[index] = {
      ...items[index],
      status: 'CANCELED',
    };
    fixtures.cuts = items;

    return HttpResponse.json(items[index]);
  }),
  ...createCrudHandlers<FieldOperationDto, CreateFieldOperationDto>(
    '/api/field-operations',
    {
      getItems: () => fixtures.fieldOperations,
      setItems: (items) => {
        fixtures.fieldOperations = items;
      },
      createItem: (payload, id) => ({
        id,
        fieldId: payload.fieldId,
        cutId: payload.cutId,
        operationType: payload.operationType,
        operationDate: payload.operationDate,
        status: payload.status,
        observation: payload.observation,
      }),
      updateItem: (current, payload) => ({
        ...current,
        fieldId: payload.fieldId,
        cutId: payload.cutId,
        operationType: payload.operationType,
        operationDate: payload.operationDate,
        status: payload.status,
        observation: payload.observation,
      }),
    },
  ),
  ...createCrudHandlers<FieldOperationMachineDto, CreateFieldOperationMachineDto>(
    '/api/field-operation-machines',
    {
      getItems: () => fixtures.fieldOperationMachines,
      setItems: (items) => {
        fixtures.fieldOperationMachines = items;
      },
      createItem: (payload, id) => ({
        id,
        fieldOperationId: payload.fieldOperationId,
        machineId: payload.machineId,
        hoursWorked: payload.hoursWorked,
        observation: payload.observation,
      }),
      updateItem: (current, payload) => ({
        ...current,
        fieldOperationId: payload.fieldOperationId,
        machineId: payload.machineId,
        hoursWorked: payload.hoursWorked,
        observation: payload.observation,
      }),
    },
  ),
  ...createCrudHandlers<FieldOperationItemDto, CreateFieldOperationItemDto>(
    '/api/field-operation-items',
    {
      getItems: () => fixtures.fieldOperationItems,
      setItems: (items) => {
        fixtures.fieldOperationItems = items;
      },
      createItem: (payload, id) => ({
        id,
        fieldOperationId: payload.fieldOperationId,
        productId: payload.productId,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        amount: payload.amount,
        inventoryMovementId: payload.inventoryMovementId,
        observation: payload.observation,
      }),
      updateItem: (current, payload) => ({
        ...current,
        fieldOperationId: payload.fieldOperationId,
        productId: payload.productId,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        amount: payload.amount,
        inventoryMovementId: payload.inventoryMovementId,
        observation: payload.observation,
      }),
    },
  ),
  ...createCrudHandlers<ProductionBatchDto, CreateProductionBatchDto>(
    '/api/production-batches',
    {
      getItems: () => fixtures.productionBatches,
      setItems: (items) => {
        fixtures.productionBatches = items;
      },
      createItem: (payload, id) => ({
        id,
        inventoryBatchId: payload.inventoryBatchId,
        inventoryMovementId: payload.inventoryMovementId,
        quantity: payload.quantity,
        qualityGrade: payload.qualityGrade,
        cutId: payload.cutId,
        observation: payload.observation,
      }),
      updateItem: (current, payload) => ({
        ...current,
        inventoryBatchId: payload.inventoryBatchId,
        inventoryMovementId: payload.inventoryMovementId,
        quantity: payload.quantity,
        qualityGrade: payload.qualityGrade,
        cutId: payload.cutId,
        observation: payload.observation,
      }),
    },
  ),
];
