import inventoryAdjustmentsJson from '../../../app/data/json/inventoryAdjustments.json';
import inventoryBatchesJson from '../../../app/data/json/inventoryBatches.json';
import inventoryMovementsJson from '../../../app/data/json/inventoryMovements.json';
import type {
  InventoryAdjustmentDto,
  InventoryBatchDto,
  InventoryMovementDto,
} from '../../../domains/inventory/api/dtos';

export function createInventoryFixtures() {
  return {
    inventoryBatches: structuredClone(inventoryBatchesJson) as InventoryBatchDto[],
    inventoryMovements: structuredClone(
      inventoryMovementsJson,
    ) as InventoryMovementDto[],
    inventoryAdjustments: structuredClone(
      inventoryAdjustmentsJson,
    ) as InventoryAdjustmentDto[],
  };
}
