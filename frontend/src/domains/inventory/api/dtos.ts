export type InventoryBatchStatus =
  | 'ACTIVE'
  | 'CONSUMED'
  | 'SOLD'
  | 'CANCELED';

export type InventoryMovementType =
  | 'PURCHASE_IN'
  | 'PRODUCTION_IN'
  | 'SALE_OUT'
  | 'CONSUMPTION_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface InventoryBatchDto {
  id: number;
  productId?: number;
  code?: string;
  batchDate?: string;
  status?: InventoryBatchStatus;
  unitCost?: number;
  quantity?: number;
}

export interface InventoryMovementDto {
  id: number;
  batchId?: number;
  movementType?: InventoryMovementType;
  quantity?: number;
  unitCost?: number;
  movementDate?: string;
  financialTransactionItemId?: number;
}

export interface InventoryAdjustmentDto {
  id: number;
  type: 'POSITIVE' | 'NEGATIVE';
  rootCauseId?: number;
  observation?: string;
  inventoryMovementId?: number;
}

export type CreateInventoryBatchDto = Omit<InventoryBatchDto, 'id'>;
export type UpdateInventoryBatchDto = CreateInventoryBatchDto;

export type CreateInventoryMovementDto = Omit<InventoryMovementDto, 'id'>;
export type UpdateInventoryMovementDto = CreateInventoryMovementDto;

export type CreateInventoryAdjustmentDto = Omit<InventoryAdjustmentDto, 'id'>;
export type UpdateInventoryAdjustmentDto = CreateInventoryAdjustmentDto;
