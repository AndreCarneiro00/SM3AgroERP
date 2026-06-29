import { normalizeById } from '../../../core/collections/normalize';
import type {
  CreateInventoryAdjustmentDto,
  CreateInventoryBatchDto,
  CreateInventoryMovementDto,
  InventoryAdjustmentDto,
  InventoryBatchDto,
  InventoryMovementDto,
} from '../api/dtos';
import type {
  InventoryAdjustment,
  InventoryAdjustmentInput,
  InventoryBatch,
  InventoryBatchInput,
  InventoryCatalog,
  InventoryMovement,
  InventoryMovementInput,
} from './entities';

export function mapInventoryBatchDto(dto: InventoryBatchDto): InventoryBatch {
  return {
    id: dto.id,
    productId: dto.productId,
    code: dto.code,
    batchDate: dto.batchDate,
    status: dto.status,
    unitCost: dto.unitCost,
    quantity: dto.quantity,
  };
}

export function mapInventoryMovementDto(
  dto: InventoryMovementDto,
): InventoryMovement {
  return {
    id: dto.id,
    batchId: dto.batchId,
    movementType: dto.movementType,
    quantity: dto.quantity,
    unitCost: dto.unitCost,
    movementDate: dto.movementDate,
    financialTransactionItemId: dto.financialTransactionItemId,
  };
}

export function mapInventoryAdjustmentDto(
  dto: InventoryAdjustmentDto,
): InventoryAdjustment {
  return {
    id: dto.id,
    type: dto.type,
    rootCauseId: dto.rootCauseId,
    observation: dto.observation,
    inventoryMovementId: dto.inventoryMovementId,
  };
}

export function mapInventoryBatchInputToDto(
  input: InventoryBatchInput,
): CreateInventoryBatchDto {
  return {
    productId: input.productId,
    code: input.code,
    batchDate: input.batchDate,
    status: input.status,
    unitCost: input.unitCost,
    quantity: input.quantity,
  };
}

export function mapInventoryMovementInputToDto(
  input: InventoryMovementInput,
): CreateInventoryMovementDto {
  return {
    batchId: input.batchId,
    movementType: input.movementType,
    quantity: input.quantity,
    unitCost: input.unitCost,
    movementDate: input.movementDate,
    financialTransactionItemId: input.financialTransactionItemId,
  };
}

export function mapInventoryAdjustmentInputToDto(
  input: InventoryAdjustmentInput,
): CreateInventoryAdjustmentDto {
  return {
    type: input.type,
    rootCauseId: input.rootCauseId,
    observation: input.observation,
    inventoryMovementId: input.inventoryMovementId,
  };
}

export function createInventoryCatalog(params: {
  inventoryBatches: InventoryBatchDto[];
  inventoryMovements: InventoryMovementDto[];
  inventoryAdjustments: InventoryAdjustmentDto[];
}): InventoryCatalog {
  const inventoryBatches = params.inventoryBatches.map(mapInventoryBatchDto);
  const inventoryMovements = params.inventoryMovements.map(
    mapInventoryMovementDto,
  );
  const inventoryAdjustments = params.inventoryAdjustments.map(
    mapInventoryAdjustmentDto,
  );

  return {
    inventoryBatches: normalizeById(inventoryBatches),
    inventoryMovements: normalizeById(inventoryMovements),
    inventoryAdjustments: normalizeById(inventoryAdjustments),
  };
}
