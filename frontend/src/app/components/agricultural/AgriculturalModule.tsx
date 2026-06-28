import { FieldsTab } from './FieldsTab';
import { MachinesTab } from './MachinesTab';
import { CutsTab } from './CutsTab';
import { FieldOperationsTab } from './FieldOperationsTab';
import { FieldOperationMachinesTab } from './FieldOperationMachinesTab';
import { FieldOperationItemsTab } from './FieldOperationItemsTab';
import { BatchesTab } from './BatchesTab';

interface Props {
  tab:
    | 'fields'
    | 'machines'
    | 'cuts'
    | 'operations'
    | 'operation-machines'
    | 'operation-items'
    | 'production-batches';
}

export function AgriculturalModule({ tab }: Props) {
  if (tab === 'machines') return <MachinesTab />;
  if (tab === 'cuts') return <CutsTab />;
  if (tab === 'operations') return <FieldOperationsTab />;
  if (tab === 'operation-machines') return <FieldOperationMachinesTab />;
  if (tab === 'operation-items') return <FieldOperationItemsTab />;
  if (tab === 'production-batches') return <BatchesTab />;
  return <FieldsTab />;
}
