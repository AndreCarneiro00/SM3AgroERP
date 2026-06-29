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
import type { FieldOperationType } from '../../../domains/agricultural/api/dtos';
import type {
  FieldOperation,
  FieldOperationInput,
} from '../../../domains/agricultural/model/entities';
import {
  selectCutLabelById,
  selectFieldLabelById,
} from '../../../domains/agricultural/selectors/selectors';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

const OPERATION_TYPE_LABEL: Record<FieldOperationType, string> = {
  PLANTING: 'Plantio',
  FERTILIZATION: 'Adubacao',
  DEFENSIVE_APPLICATION: 'Aplicacao defensiva',
  IRRIGATION: 'Irrigacao',
  SOIL_CORRECTION: 'Correcao de solo',
  MOWING: 'Corte',
  BALING: 'Enfardamento',
  FIELD_REFORM: 'Reforma de campo',
  OTHER: 'Outro',
};

const OPERATION_STATUS_COLOR: Record<
  FieldOperation['status'],
  'default' | 'success' | 'warning'
> = {
  PLANNED: 'warning',
  DONE: 'success',
  CANCELED: 'default',
};

function toFieldOperationInput(
  form: Partial<FieldOperation>,
): FieldOperationInput {
  return {
    fieldId: form.fieldId,
    cutId: form.cutId,
    operationType: form.operationType ?? 'PLANTING',
    operationDate:
      form.operationDate ?? new Date().toISOString().split('T')[0],
    status: form.status ?? 'PLANNED',
    observation: form.observation,
  };
}

export function FieldOperationsTab() {
  const { catalog, fieldOperations, fields, cuts } =
    useAgriculturalCatalogData();
  const { createFieldOperation, updateFieldOperation, deleteFieldOperation } =
    useAgriculturalMutations();

  return (
    <CrudTable<FieldOperation>
      items={fieldOperations}
      onCreate={(input) =>
        createFieldOperation.mutateAsync(toFieldOperationInput(input))
      }
      onUpdate={({ id, input }) =>
        updateFieldOperation.mutateAsync({
          id,
          input: toFieldOperationInput(input),
        })
      }
      onDelete={(id) => deleteFieldOperation.mutateAsync(id)}
      actionLabel="Nova Operacao"
      dialogTitle={(editing) =>
        editing ? 'Editar Operacao de Campo' : 'Nova Operacao de Campo'
      }
      createInitial={() => ({
        operationType: 'PLANTING',
        status: 'PLANNED',
        operationDate: new Date().toISOString().split('T')[0],
      })}
      columns={[
        {
          label: 'Campo',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {selectFieldLabelById(catalog, item.fieldId)}
            </Typography>
          ),
        },
        {
          label: 'Corte',
          render: (item) =>
            item.cutId ? selectCutLabelById(catalog, item.cutId) : '-',
        },
        {
          label: 'Tipo',
          render: (item) => OPERATION_TYPE_LABEL[item.operationType],
        },
        { label: 'Data', render: (item) => item.operationDate },
        {
          label: 'Status',
          render: (item) => (
            <Chip
              label={item.status}
              size="small"
              color={OPERATION_STATUS_COLOR[item.status]}
              sx={{ height: 20 }}
            />
          ),
        },
        { label: 'Observacao', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Campo</InputLabel>
              <Select
                value={String(form.fieldId ?? '')}
                label="Campo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fieldId: Number(event.target.value),
                  }))
                }
              >
                {fields.map((field) => (
                  <MenuItem key={field.id} value={String(field.id)}>
                    {field.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Corte</InputLabel>
              <Select
                value={String(form.cutId ?? '')}
                label="Corte"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    cutId: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              >
                <MenuItem value="">- Nenhum -</MenuItem>
                {cuts.map((cut) => (
                  <MenuItem key={cut.id} value={String(cut.id)}>
                    {selectCutLabelById(catalog, cut.id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.operationType ?? 'PLANTING')}
                label="Tipo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    operationType: event.target.value as FieldOperationType,
                  }))
                }
              >
                {Object.entries(OPERATION_TYPE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={String(form.status ?? 'PLANNED')}
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as FieldOperation['status'],
                  }))
                }
              >
                <MenuItem value="PLANNED">PLANNED</MenuItem>
                <MenuItem value="DONE">DONE</MenuItem>
                <MenuItem value="CANCELED">CANCELED</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Data da Operacao"
            type="date"
            value={form.operationDate ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                operationDate: event.target.value,
              }))
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
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
      isSaveDisabled={(form) =>
        !form.fieldId || !form.operationType || !form.operationDate || !form.status
      }
      emptyMessage="Nenhuma operacao de campo cadastrada."
      sortItems={(items) =>
        [...items].sort((left, right) =>
          right.operationDate.localeCompare(left.operationDate),
        )
      }
    />
  );
}
