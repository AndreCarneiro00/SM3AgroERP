import {
  Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { Machine, MachineType } from '../../data/types';

const MACHINE_TYPE_LABEL: Record<MachineType, string> = {
  TRACTOR: 'Trator',
  BALER: 'Enfardadeira',
  MOWER: 'Segadeira',
  SPRAYER: 'Pulverizador',
  FERTILIZER_SPREADER: 'Distribuidor',
  IRRIGATION: 'Irrigação',
  PUMP: 'Bomba',
  OTHER: 'Outro',
};

export function MachinesTab() {
  const { machines, setMachines, nextId } = useApp();

  return (
    <CrudTable<Machine>
      items={machines}
      setItems={setMachines}
      nextId={nextId}
      actionLabel="Nova Máquina"
      dialogTitle={(editing) => editing ? 'Editar Máquina' : 'Nova Máquina'}
      createInitial={() => ({ machine_type: 'TRACTOR', active: true })}
      columns={[
        {
          label: 'Nome',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {item.name}
            </Typography>
          ),
        },
        { label: 'Tipo', render: (item) => MACHINE_TYPE_LABEL[item.machine_type] },
        { label: 'Fabricante / Modelo', render: (item) => [item.manufacturer, item.model].filter(Boolean).join(' / ') || '-' },
        { label: 'Ano', render: (item) => item.year ?? '-' },
        {
          label: 'Status',
          render: (item) => (
            <Chip label={item.active ? 'Ativa' : 'Inativa'} size="small" color={item.active ? 'success' : 'default'} sx={{ height: 20 }} />
          ),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <TextField
            label="Nome"
            value={form.name ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.machine_type ?? 'TRACTOR')}
                label="Tipo"
                onChange={(event) => setForm((current) => ({ ...current, machine_type: event.target.value as MachineType }))}
              >
                {Object.entries(MACHINE_TYPE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>{label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.active === false ? 'inactive' : 'active'}
                label="Status"
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.value === 'active' }))}
              >
                <MenuItem value="active">Ativa</MenuItem>
                <MenuItem value="inactive">Inativa</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Fabricante"
              value={form.manufacturer ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, manufacturer: event.target.value || undefined }))}
              fullWidth
            />
            <TextField
              label="Modelo"
              value={form.model ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, model: event.target.value || undefined }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Ano"
            type="number"
            value={String(form.year ?? '')}
            onChange={(event) => setForm((current) => ({ ...current, year: event.target.value ? Number(event.target.value) : undefined }))}
            fullWidth
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
      isSaveDisabled={(form) => !form.name}
      emptyMessage="Nenhuma máquina cadastrada."
    />
  );
}
