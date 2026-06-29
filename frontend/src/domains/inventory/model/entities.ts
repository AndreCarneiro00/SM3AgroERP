import type { EntityCollection } from '../../../core/collections/types';
import type {
  InventoryBatchStatus,
  InventoryMovementType,
} from '../api/dtos';

export interface InventoryBatch {
  id: number;
  productId?: number;
  code?: string;
  batchDate?: string;
  status?: InventoryBatchStatus;
  unitCost?: number;
  quantity?: number;
}

export interface InventoryMovement {
  id: number;
  batchId?: number;
  movementType?: InventoryMovementType;
  quantity?: number;
  unitCost?: number;
  movementDate?: string;
  financialTransactionItemId?: number;
}

export interface InventoryAdjustment {
  id: number;
  type: 'POSITIVE' | 'NEGATIVE';
  rootCauseId?: number;
  observation?: string;
  inventoryMovementId?: number;
}

export interface InventoryCatalog {
  inventoryBatches: EntityCollection<InventoryBatch>;
  inventoryMovements: EntityCollection<InventoryMovement>;
  inventoryAdjustments: EntityCollection<InventoryAdjustment>;
}

export interface InventoryBatchInput {
  productId?: number;
  code?: string;
  batchDate?: string;
  status?: InventoryBatchStatus;
  unitCost?: number;
  quantity?: number;
}

export interface InventoryMovementInput {
  batchId?: number;
  movementType?: InventoryMovementType;
  quantity?: number;
  unitCost?: number;
  movementDate?: string;
  financialTransactionItemId?: number;
}

export interface InventoryAdjustmentInput {
  type: 'POSITIVE' | 'NEGATIVE';
  rootCauseId?: number;
  observation?: string;
  inventoryMovementId?: number;
}
