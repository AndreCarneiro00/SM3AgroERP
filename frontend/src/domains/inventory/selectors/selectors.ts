import { selectAll, selectById } from '../../../core/collections/selectors';
import type {
  InventoryBatch,
  InventoryCatalog,
  InventoryMovement,
} from '../model/entities';

export function selectInventoryBatches(catalog: InventoryCatalog) {
  return selectAll(catalog.inventoryBatches);
}

export function selectInventoryMovements(catalog: InventoryCatalog) {
  return selectAll(catalog.inventoryMovements);
}

export function selectInventoryAdjustments(catalog: InventoryCatalog) {
  return selectAll(catalog.inventoryAdjustments);
}

export function selectInventoryBatchDisplayName(
  inventoryBatch?: Partial<InventoryBatch>,
) {
  if (!inventoryBatch) return '-';
  return inventoryBatch.code?.trim() || `#${inventoryBatch.id ?? '-'}`;
}

export function selectInventoryBatchLabelById(
  catalog: InventoryCatalog,
  inventoryBatchId?: number,
) {
  return selectInventoryBatchDisplayName(
    selectById(catalog.inventoryBatches, inventoryBatchId),
  );
}

export function selectInventoryMovementDisplayName(
  inventoryMovement?: Partial<InventoryMovement>,
) {
  if (!inventoryMovement) return '-';
  const movementType = inventoryMovement.movementType ?? 'MOVEMENT';
  const movementDate = inventoryMovement.movementDate ?? '-';
  return `#${inventoryMovement.id ?? '-'} - ${movementType} - ${movementDate}`;
}

export function selectInventoryMovementLabelById(
  catalog: InventoryCatalog,
  inventoryMovementId?: number,
) {
  return selectInventoryMovementDisplayName(
    selectById(catalog.inventoryMovements, inventoryMovementId),
  );
}
