import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  CreateCutDto,
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
  MachineDto,
  ProductionBatchDto,
} from '../../../domains/agricultural/api/dtos';
import { createAgriculturalFixtures } from '../fixtures/agricultural';

const fixtures = createAgriculturalFixtures();

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
  ...createCrudHandlers<CutDto, CreateCutDto>('/api/cuts', {
    getItems: () => fixtures.cuts,
    setItems: (items) => {
      fixtures.cuts = items;
    },
    createItem: (payload, id) => ({
      id,
      fieldId: payload.fieldId,
      productFamilyId: payload.productFamilyId,
      cutDate: payload.cutDate,
      cutNumber: payload.cutNumber,
      observation: payload.observation,
      daysSinceLastCut: payload.daysSinceLastCut,
    }),
    updateItem: (current, payload) => ({
      ...current,
      fieldId: payload.fieldId,
      productFamilyId: payload.productFamilyId,
      cutDate: payload.cutDate,
      cutNumber: payload.cutNumber,
      observation: payload.observation,
      daysSinceLastCut: payload.daysSinceLastCut,
    }),
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
        qualityGrade: payload.qualityGrade,
        cutId: payload.cutId,
        observation: payload.observation,
      }),
      updateItem: (current, payload) => ({
        ...current,
        inventoryBatchId: payload.inventoryBatchId,
        qualityGrade: payload.qualityGrade,
        cutId: payload.cutId,
        observation: payload.observation,
      }),
    },
  ),
];
