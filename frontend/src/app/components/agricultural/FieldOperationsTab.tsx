import {
  Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { FieldOperation, FieldOperationType } from '../../data/types';

const OPERATION_TYPE_LABEL: Record<FieldOperationType, string> = {
  PLANTING: 'Plantio',
  FERTILIZATION: 'Adubação',
  DEFENSIVE_APPLICATION: 'Aplicação defensiva',
  IRRIGATION: 'Irrigação',
  SOIL_CORRECTION: 'Correção de solo',
  MOWING: 'Corte',
  BALING: 'Enfardamento',
  FIELD_REFORM: 'Reforma de campo',
  OTHER: 'Outro',
};

const OPERATION_STATUS_COLOR: Record<FieldOperation['status'], 'default' | 'success' | 'warning'> = {
  PLANNED: 'warning',
  DONE: 'success',
  CANCELED: 'default',
};

export function FieldOperationsTab() {
  const { fieldOperations, setFieldOperations, fields, cuts, nextId } = useApp();

  return (
    <CrudTable<FieldOperation>
      items={fieldOperations}
      setItems={setFieldOperations}
      nextId={nextId}
      actionLabel="Nova Operação"
      dialogTitle={(editing) => editing ? 'Editar Operação de Campo' : 'Nova Operação de Campo'}
      createInitial={() => ({
        operation_type: 'PLANTING',
        status: 'PLANNED',
        operation_date: new Date().toISOString().split('T')[0],
      })}
      columns={[
        {
          label: 'Campo',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {fields.find((field) => field.id === item.field_id)?.name ?? '-'}
            </Typography>
          ),
        },
        { label: 'Corte', render: (item) => item.cut_id ? `#${cuts.find((cut) => cut.id === item.cut_id)?.cut_number ?? item.cut_id}` : '-' },
        { label: 'Tipo', render: (item) => OPERATION_TYPE_LABEL[item.operation_type] },
        { label: 'Data', render: (item) => item.operation_date },
        {
          label: 'Status',
          render: (item) => (
            <Chip label={item.status} size="small" color={OPERATION_STATUS_COLOR[item.status]} sx={{ height: 20 }} />
          ),
        },
        { label: 'Observação', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Campo</InputLabel>
              <Select
                value={String(form.field_id ?? '')}
                label="Campo"
                onChange={(event) => setForm((current) => ({ ...current, field_id: Number(event.target.value) }))}
              >
                {fields.map((field) => (
                  <MenuItem key={field.id} value={String(field.id)}>{field.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Corte</InputLabel>
              <Select
                value={String(form.cut_id ?? '')}
                label="Corte"
                onChange={(event) => setForm((current) => ({ ...current, cut_id: event.target.value ? Number(event.target.value) : undefined }))}
              >
                <MenuItem value="">— Nenhum —</MenuItem>
                {cuts.map((cut) => (
                  <MenuItem key={cut.id} value={String(cut.id)}>
                    Corte #{cut.cut_number} • {cut.cut_date}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.operation_type ?? 'PLANTING')}
                label="Tipo"
                onChange={(event) => setForm((current) => ({ ...current, operation_type: event.target.value as FieldOperationType }))}
              >
                {Object.entries(OPERATION_TYPE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={String(form.status ?? 'PLANNED')}
                label="Status"
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as FieldOperation['status'] }))}
              >
                <MenuItem value="PLANNED">PLANNED</MenuItem>
                <MenuItem value="DONE">DONE</MenuItem>
                <MenuItem value="CANCELED">CANCELED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Data da Operação"
            type="date"
            value={form.operation_date ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, operation_date: event.target.value }))}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
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
      isSaveDisabled={(form) => !form.field_id || !form.operation_type || !form.operation_date || !form.status}
      emptyMessage="Nenhuma operação de campo cadastrada."
      sortItems={(items) => [...items].sort((left, right) => right.operation_date.localeCompare(left.operation_date))}
    />
  );
}
