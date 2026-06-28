import {
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { CounterpartyType } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { CounterpartiesTab } from './CounterpartiesTab';
import { SimpleListTab } from './SimpleListTab';

function CounterpartyTypesTab() {
  const { counterpartyTypes, setCounterpartyTypes, nextId } = useApp();

  return (
    <SimpleListTab
      items={counterpartyTypes}
      setItems={setCounterpartyTypes}
      nextId={items => nextId(items)}
      entityLabel="Tipo de Contraparte"
      extraColumns={[{ key: 'description' as keyof CounterpartyType, label: 'Descrição' }]}
      ExtraFields={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={(form as CounterpartyType).active ? 'ativo' : 'inativo'}
              label="Status"
              onChange={e => setForm(f => ({ ...f, active: e.target.value === 'ativo' }))}
            >
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
        </>
      )}
    />
  );
}

interface Props {
  tab: 'counterparties' | 'counterparty-types' | 'segments' | 'activity-groups' | 'document-types' | 'adjustment-root-causes';
}

export function MasterDataModule({ tab }: Props) {
  const {
    segments,
    setSegments,
    activityGroups,
    setActivityGroups,
    documentTypes,
    setDocumentTypes,
    adjustmentRootCauses,
    setAdjustmentRootCauses,
    nextId,
  } = useApp();

  if (tab === 'counterparties')     return <CounterpartiesTab />;
  if (tab === 'counterparty-types') return <CounterpartyTypesTab />;

  if (tab === 'segments') {
    return (
      <SimpleListTab
        items={segments}
        setItems={setSegments}
        nextId={items => nextId(items)}
        entityLabel="Segmento"
      />
    );
  }

  if (tab === 'activity-groups') {
    return (
      <SimpleListTab
        items={activityGroups}
        setItems={setActivityGroups}
        nextId={items => nextId(items)}
        entityLabel="Grupo de Atividade"
      />
    );
  }

  if (tab === 'adjustment-root-causes') {
    return (
      <SimpleListTab
        items={adjustmentRootCauses}
        setItems={setAdjustmentRootCauses}
        nextId={items => nextId(items)}
        entityLabel="Causa Raiz de Ajuste"
      />
    );
  }

  return (
    <SimpleListTab
      items={documentTypes}
      setItems={setDocumentTypes}
      nextId={items => nextId(items)}
      entityLabel="Tipo de Documento"
    />
  );
}
