import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  CreateInventoryAdjustmentDto,
  CreateInventoryBatchDto,
  CreateInventoryMovementDto,
  InventoryAdjustmentDto,
  InventoryBatchDto,
  InventoryMovementDto,
  UpdateInventoryAdjustmentDto,
  UpdateInventoryBatchDto,
  UpdateInventoryMovementDto,
} from './dtos';

const INVENTORY_BATCHES_API_BASE = {
  mock: '/api/inventory-batches',
  api: '/inventory-batches',
} as const;
const INVENTORY_MOVEMENTS_API_BASE = {
  mock: '/api/inventory-movements',
  api: '/inventory-movements',
} as const;
const INVENTORY_ADJUSTMENTS_API_BASE = {
  mock: '/api/inventory-adjustments',
  api: '/inventory-adjustments',
} as const;

export const inventoryRepository = {
  listInventoryBatches: () =>
    httpListRequest<InventoryBatchDto>(resolveResourcePath(INVENTORY_BATCHES_API_BASE)),
  createInventoryBatch: (payload: CreateInventoryBatchDto) =>
    httpRequest<InventoryBatchDto>(resolveResourcePath(INVENTORY_BATCHES_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInventoryBatch: (id: number, payload: UpdateInventoryBatchDto) =>
    httpRequest<InventoryBatchDto>(
      resolveResourceItemPath(INVENTORY_BATCHES_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteInventoryBatch: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(INVENTORY_BATCHES_API_BASE, id), {
      method: 'DELETE',
    }),

  listInventoryMovements: () =>
    httpListRequest<InventoryMovementDto>(resolveResourcePath(INVENTORY_MOVEMENTS_API_BASE)),
  createInventoryMovement: (payload: CreateInventoryMovementDto) =>
    httpRequest<InventoryMovementDto>(resolveResourcePath(INVENTORY_MOVEMENTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateInventoryMovement: (id: number, payload: UpdateInventoryMovementDto) =>
    httpRequest<InventoryMovementDto>(
      resolveResourceItemPath(INVENTORY_MOVEMENTS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteInventoryMovement: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(INVENTORY_MOVEMENTS_API_BASE, id), {
      method: 'DELETE',
    }),

  listInventoryAdjustments: () =>
    httpListRequest<InventoryAdjustmentDto>(
      resolveResourcePath(INVENTORY_ADJUSTMENTS_API_BASE),
    ),
  createInventoryAdjustment: (payload: CreateInventoryAdjustmentDto) =>
    httpRequest<InventoryAdjustmentDto>(
      resolveResourcePath(INVENTORY_ADJUSTMENTS_API_BASE),
      {
      method: 'POST',
      body: JSON.stringify(payload),
      },
    ),
  updateInventoryAdjustment: (
    id: number,
    payload: UpdateInventoryAdjustmentDto,
  ) =>
    httpRequest<InventoryAdjustmentDto>(
      resolveResourceItemPath(INVENTORY_ADJUSTMENTS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteInventoryAdjustment: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(INVENTORY_ADJUSTMENTS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),
};
