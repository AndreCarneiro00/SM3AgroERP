import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { MachineType } from '../../../domains/agricultural/api/dtos';
import type {
  Machine,
  MachineInput,
} from '../../../domains/agricultural/model/entities';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

const MACHINE_TYPE_LABEL: Record<MachineType, string> = {
  TRACTOR: 'Trator',
  BALER: 'Enfardadeira',
  MOWER: 'Segadeira',
  SPRAYER: 'Pulverizador',
  FERTILIZER_SPREADER: 'Distribuidor',
  IRRIGATION: 'Irrigacao',
  PUMP: 'Bomba',
  OTHER: 'Outro',
};

function toMachineInput(form: Partial<Machine>): MachineInput {
  return {
    name: form.name ?? '',
    machineType: form.machineType ?? 'TRACTOR',
    manufacturer: form.manufacturer,
    model: form.model,
    year: form.year,
    active: form.active ?? true,
    observation: form.observation,
  };
}

export function MachinesTab() {
  const { machines } = useAgriculturalCatalogData();
  const { createMachine, updateMachine, deleteMachine } =
    useAgriculturalMutations();

  return (
    <CrudTable<Machine>
      items={machines}
      onCreate={(input) => createMachine.mutateAsync(toMachineInput(input))}
      onUpdate={({ id, input }) =>
        updateMachine.mutateAsync({ id, input: toMachineInput(input) })
      }
      onDelete={(id) => deleteMachine.mutateAsync(id)}
      actionLabel="Nova Maquina"
      dialogTitle={(editing) =>
        editing ? 'Editar Maquina' : 'Nova Maquina'
      }
      createInitial={() => ({ machineType: 'TRACTOR', active: true })}
      columns={[
        {
          label: 'Nome',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {item.name}
            </Typography>
          ),
        },
        {
          label: 'Tipo',
          render: (item) => MACHINE_TYPE_LABEL[item.machineType],
        },
        {
          label: 'Fabricante / Modelo',
          render: (item) =>
            [item.manufacturer, item.model].filter(Boolean).join(' / ') || '-',
        },
        { label: 'Ano', render: (item) => item.year ?? '-' },
        {
          label: 'Status',
          render: (item) => (
            <Chip
              label={item.active ? 'Ativa' : 'Inativa'}
              size="small"
              color={item.active ? 'success' : 'default'}
              sx={{ height: 20 }}
            />
          ),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <TextField
            label="Nome"
            value={form.name ?? ''}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.machineType ?? 'TRACTOR')}
                label="Tipo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    machineType: event.target.value as MachineType,
                  }))
                }
              >
                {Object.entries(MACHINE_TYPE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.active === false ? 'inactive' : 'active'}
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.value === 'active',
                  }))
                }
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
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  manufacturer: event.target.value || undefined,
                }))
              }
              fullWidth
            />
            <TextField
              label="Modelo"
              value={form.model ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  model: event.target.value || undefined,
                }))
              }
              fullWidth
            />
          </Stack>
          <TextField
            label="Ano"
            type="number"
            value={String(form.year ?? '')}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                year: event.target.value ? Number(event.target.value) : undefined,
              }))
            }
            fullWidth
          />
          <TextField
            label="Observacao"
            value={form.observation ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                observation: event.target.value || undefined,
              }))
            }
            fullWidth
            multiline
            rows={2}
          />
        </>
      )}
      isSaveDisabled={(form) => !form.name}
      emptyMessage="Nenhuma maquina cadastrada."
    />
  );
}
