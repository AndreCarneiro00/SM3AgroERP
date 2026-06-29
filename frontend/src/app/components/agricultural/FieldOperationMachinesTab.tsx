import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  FieldOperationMachine,
  FieldOperationMachineInput,
} from '../../../domains/agricultural/model/entities';
import {
  selectFieldOperationLabelById,
  selectMachineLabelById,
} from '../../../domains/agricultural/selectors/selectors';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

function toFieldOperationMachineInput(
  form: Partial<FieldOperationMachine>,
): FieldOperationMachineInput {
  return {
    fieldOperationId: form.fieldOperationId,
    machineId: form.machineId,
    hoursWorked: form.hoursWorked,
    observation: form.observation,
  };
}

export function FieldOperationMachinesTab() {
  const { catalog, fieldOperationMachines, fieldOperations, machines } =
    useAgriculturalCatalogData();
  const {
    createFieldOperationMachine,
    updateFieldOperationMachine,
    deleteFieldOperationMachine,
  } = useAgriculturalMutations();

  return (
    <CrudTable<FieldOperationMachine>
      items={fieldOperationMachines}
      onCreate={(input) =>
        createFieldOperationMachine.mutateAsync(
          toFieldOperationMachineInput(input),
        )
      }
      onUpdate={({ id, input }) =>
        updateFieldOperationMachine.mutateAsync({
          id,
          input: toFieldOperationMachineInput(input),
        })
      }
      onDelete={(id) => deleteFieldOperationMachine.mutateAsync(id)}
      actionLabel="Novo Vinculo de Maquina"
      dialogTitle={(editing) =>
        editing ? 'Editar Vinculo de Maquina' : 'Novo Vinculo de Maquina'
      }
      createInitial={() => ({})}
      columns={[
        {
          label: 'Operacao',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {selectFieldOperationLabelById(catalog, item.fieldOperationId)}
            </Typography>
          ),
        },
        {
          label: 'Maquina',
          render: (item) => selectMachineLabelById(catalog, item.machineId),
        },
        {
          label: 'Horas',
          align: 'right',
          render: (item) => item.hoursWorked?.toLocaleString('pt-BR') ?? '-',
        },
        { label: 'Observacao', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Operacao</InputLabel>
            <Select
              value={String(form.fieldOperationId ?? '')}
              label="Operacao"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fieldOperationId: Number(event.target.value),
                }))
              }
            >
              {fieldOperations.map((operation) => (
                <MenuItem key={operation.id} value={String(operation.id)}>
                  {selectFieldOperationLabelById(catalog, operation.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Maquina</InputLabel>
            <Select
              value={String(form.machineId ?? '')}
              label="Maquina"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  machineId: Number(event.target.value),
                }))
              }
            >
              {machines.map((machine) => (
                <MenuItem key={machine.id} value={String(machine.id)}>
                  {machine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Horas Trabalhadas"
              type="number"
              value={String(form.hoursWorked ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  hoursWorked: event.target.value
                    ? Number(event.target.value)
                    : undefined,
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
            />
          </Stack>
        </>
      )}
      isSaveDisabled={(form) => !form.fieldOperationId || !form.machineId}
      emptyMessage="Nenhum vinculo de maquina cadastrado."
    />
  );
}
