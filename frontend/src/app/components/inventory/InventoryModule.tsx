import { InventoryBatchesTab } from './InventoryBatchesTab';
import { InventoryMovementsTab } from './InventoryMovementsTab';
import { InventoryAdjustmentsTab } from './InventoryAdjustmentsTab';

interface Props {
  tab: 'batches' | 'movements' | 'adjustments';
}

export function InventoryModule({ tab }: Props) {
  if (tab === 'batches') return <InventoryBatchesTab />;
  if (tab === 'adjustments') return <InventoryAdjustmentsTab />;
  return <InventoryMovementsTab />;
}
