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

export const inventoryFixtures = createInventoryFixtures();

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
    return HttpResponse.json(inventoryFixtures.inventoryBatches);
  }),
  http.post(`/api/inventory-batches`, async ({ request }) => {
    const payload = (await request.json()) as CreateInventoryBatchDto;
    const created: InventoryBatchDto = {
      id: nextId(inventoryFixtures.inventoryBatches),
      productId: payload.productId,
      code: payload.code,
      batchDate: payload.batchDate,
      status: payload.status,
      unitCost: payload.unitCost,
      quantity: payload.quantity,
    };
    inventoryFixtures.inventoryBatches.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/inventory-batches/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryBatchDto;
      const index = inventoryFixtures.inventoryBatches.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      inventoryFixtures.inventoryBatches[index] = {
        ...inventoryFixtures.inventoryBatches[index],
        productId: payload.productId,
        code: payload.code,
        batchDate: payload.batchDate,
        status: payload.status,
        unitCost: payload.unitCost,
        quantity: payload.quantity,
      };

      return HttpResponse.json(inventoryFixtures.inventoryBatches[index]);
    },
  ),
  http.delete(`/api/inventory-batches/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    inventoryFixtures.inventoryBatches = inventoryFixtures.inventoryBatches.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/inventory-movements`, () => {
    return HttpResponse.json(inventoryFixtures.inventoryMovements);
  }),
  http.post(`/api/inventory-movements`, async ({ request }) => {
    const payload = (await request.json()) as CreateInventoryMovementDto;
    const created: InventoryMovementDto = {
      id: nextId(inventoryFixtures.inventoryMovements),
      batchId: payload.batchId,
      movementType: payload.movementType,
      quantity: payload.quantity,
      unitCost: payload.unitCost,
      movementDate: payload.movementDate,
      financialTransactionItemId: payload.financialTransactionItemId,
    };
    inventoryFixtures.inventoryMovements.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/inventory-movements/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryMovementDto;
      const index = inventoryFixtures.inventoryMovements.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      inventoryFixtures.inventoryMovements[index] = {
        ...inventoryFixtures.inventoryMovements[index],
        batchId: payload.batchId,
        movementType: payload.movementType,
        quantity: payload.quantity,
        unitCost: payload.unitCost,
        movementDate: payload.movementDate,
        financialTransactionItemId: payload.financialTransactionItemId,
      };

      return HttpResponse.json(inventoryFixtures.inventoryMovements[index]);
    },
  ),
  http.delete(`/api/inventory-movements/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    inventoryFixtures.inventoryMovements = inventoryFixtures.inventoryMovements.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/inventory-adjustments`, () => {
    return HttpResponse.json(inventoryFixtures.inventoryAdjustments);
  }),
  http.post(
    `/api/inventory-adjustments`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateInventoryAdjustmentDto;
      const created: InventoryAdjustmentDto = {
        id: nextId(inventoryFixtures.inventoryAdjustments),
        type: payload.type,
        rootCauseId: payload.rootCauseId,
        observation: payload.observation,
        inventoryMovementId: payload.inventoryMovementId,
      };
      inventoryFixtures.inventoryAdjustments.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/inventory-adjustments/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateInventoryAdjustmentDto;
      const index = inventoryFixtures.inventoryAdjustments.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      inventoryFixtures.inventoryAdjustments[index] = {
        ...inventoryFixtures.inventoryAdjustments[index],
        type: payload.type,
        rootCauseId: payload.rootCauseId,
        observation: payload.observation,
        inventoryMovementId: payload.inventoryMovementId,
      };

      return HttpResponse.json(inventoryFixtures.inventoryAdjustments[index]);
    },
  ),
  http.delete(
    `/api/inventory-adjustments/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      inventoryFixtures.inventoryAdjustments = inventoryFixtures.inventoryAdjustments.filter(
        (item) => item.id !== id,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),
];
