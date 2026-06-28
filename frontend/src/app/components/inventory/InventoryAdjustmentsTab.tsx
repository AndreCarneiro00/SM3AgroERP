import {
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { InventoryAdjustment } from '../../data/types';

export function InventoryAdjustmentsTab() {
  const {
    inventoryAdjustments,
    setInventoryAdjustments,
    adjustmentRootCauses,
    inventoryMovements,
    nextId,
  } = useApp();

  return (
    <CrudTable<InventoryAdjustment>
      items={inventoryAdjustments}
      setItems={setInventoryAdjustments}
      nextId={nextId}
      actionLabel="Novo Ajuste"
      dialogTitle={(editing) => editing ? 'Editar Ajuste de Estoque' : 'Novo Ajuste de Estoque'}
      createInitial={() => ({ type: 'POSITIVE' })}
      columns={[
        { label: 'Tipo', render: (item) => <Typography variant="body2" fontWeight={500}>{item.type}</Typography> },
        { label: 'Causa Raiz', render: (item) => adjustmentRootCauses.find((cause) => cause.id === item.root_cause_id)?.name ?? '-' },
        { label: 'Movimento', render: (item) => item.inventory_movement_id ? `#${item.inventory_movement_id}` : '-' },
        { label: 'Observação', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.type ?? 'POSITIVE')}
                label="Tipo"
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as InventoryAdjustment['type'] }))}
              >
                <MenuItem value="POSITIVE">POSITIVE</MenuItem>
                <MenuItem value="NEGATIVE">NEGATIVE</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Causa Raiz</InputLabel>
              <Select
                value={String(form.root_cause_id ?? '')}
                label="Causa Raiz"
                onChange={(event) => setForm((current) => ({ ...current, root_cause_id: Number(event.target.value) }))}
              >
                {adjustmentRootCauses.map((cause) => (
                  <MenuItem key={cause.id} value={String(cause.id)}>{cause.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel>Movimento</InputLabel>
            <Select
              value={String(form.inventory_movement_id ?? '')}
              label="Movimento"
              onChange={(event) => setForm((current) => ({ ...current, inventory_movement_id: Number(event.target.value) }))}
            >
              {inventoryMovements.map((movement) => (
                <MenuItem key={movement.id} value={String(movement.id)}>
                  #{movement.id} • {movement.movement_type} • {movement.movement_date}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Observação"
            value={form.observation ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, observation: event.target.value || undefined }))}
            fullWidth
            multiline
            rows={2}
          />
        </>
      )}
      isSaveDisabled={(form) => !form.type || !form.root_cause_id || !form.inventory_movement_id}
      emptyMessage="Nenhum ajuste de estoque cadastrado."
    />
  );
}
