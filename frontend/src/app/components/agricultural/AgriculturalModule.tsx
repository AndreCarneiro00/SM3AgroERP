import { FieldsTab } from './FieldsTab';
import { CutsTab } from './CutsTab';
import { BatchesTab } from './BatchesTab';

interface Props {
  tab: 'fields' | 'cuts' | 'batches';
}

export function AgriculturalModule({ tab }: Props) {
  if (tab === 'cuts') return <CutsTab />;
  if (tab === 'batches') return <BatchesTab />;
  return <FieldsTab />;
}
