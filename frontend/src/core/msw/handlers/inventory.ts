import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  CreateInventoryAdjustmentDto,
  CreateInventoryBatchDto,
  CreateInventoryMovementDto,
  InventoryAdjustmentDto,
  InventoryBatchDto,
  InventoryMovementDto,
} from '../../../domains/inventory/api/dtos';
import { createInventoryFixtures } from '../fixtures/inventory';

const fixtures = createInventoryFixtures();

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

export const inventoryHandlers: RequestHandler[] = [
  http.get(`/api/inventory-batches`, () => {
    return HttpResponse.json(fixtures.inventoryBatches);
  }),
  http.post(`/api/inventory-batches`, async ({ request }) => {
    const payload = (await request.json()) as CreateInventoryBatchDto;
    const created: InventoryBatchDto = {
      id: nextId(fixtures.inventoryBatches),
      productId: payload.productId,
      code: payload.code,
      batchDate: payload.batchDate,
      status: payload.status,
      unitCost: payload.unitCost,
      quantity: payload.quantity,
    };
    fixtures.inventoryBatches.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/inventory-batches/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryBatchDto;
      const index = fixtures.inventoryBatches.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.inventoryBatches[index] = {
        ...fixtures.inventoryBatches[index],
        productId: payload.productId,
        code: payload.code,
        batchDate: payload.batchDate,
        status: payload.status,
        unitCost: payload.unitCost,
        quantity: payload.quantity,
      };

      return HttpResponse.json(fixtures.inventoryBatches[index]);
    },
  ),
  http.delete(`/api/inventory-batches/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.inventoryBatches = fixtures.inventoryBatches.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/inventory-movements`, () => {
    return HttpResponse.json(fixtures.inventoryMovements);
  }),
  http.post(`/api/inventory-movements`, async ({ request }) => {
    const payload = (await request.json()) as CreateInventoryMovementDto;
    const created: InventoryMovementDto = {
      id: nextId(fixtures.inventoryMovements),
      batchId: payload.batchId,
      movementType: payload.movementType,
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      movementDate: payload.movementDate,
      financialTransactionItemId: payload.financialTransactionItemId,
    };
    fixtures.inventoryMovements.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/inventory-movements/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryMovementDto;
      const index = fixtures.inventoryMovements.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.inventoryMovements[index] = {
        ...fixtures.inventoryMovements[index],
        batchId: payload.batchId,
        movementType: payload.movementType,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        movementDate: payload.movementDate,
        financialTransactionItemId: payload.financialTransactionItemId,
      };

      return HttpResponse.json(fixtures.inventoryMovements[index]);
    },
  ),
  http.delete(`/api/inventory-movements/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.inventoryMovements = fixtures.inventoryMovements.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/inventory-adjustments`, () => {
    return HttpResponse.json(fixtures.inventoryAdjustments);
  }),
  http.post(
    `/api/inventory-adjustments`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateInventoryAdjustmentDto;
      const created: InventoryAdjustmentDto = {
        id: nextId(fixtures.inventoryAdjustments),
        type: payload.type,
        rootCauseId: payload.rootCauseId,
        observation: payload.observation,
        inventoryMovementId: payload.inventoryMovementId,
      };
      fixtures.inventoryAdjustments.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/inventory-adjustments/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryAdjustmentDto;
      const index = fixtures.inventoryAdjustments.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.inventoryAdjustments[index] = {
        ...fixtures.inventoryAdjustments[index],
        type: payload.type,
        rootCauseId: payload.rootCauseId,
        observation: payload.observation,
        inventoryMovementId: payload.inventoryMovementId,
      };

      return HttpResponse.json(fixtures.inventoryAdjustments[index]);
    },
  ),
  http.delete(
    `/api/inventory-adjustments/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.inventoryAdjustments = fixtures.inventoryAdjustments.filter(
        (item) => item.id !== id,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
