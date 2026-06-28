import {
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { FieldOperationMachine } from '../../data/types';

export function FieldOperationMachinesTab() {
  const {
    fieldOperationMachines,
    setFieldOperationMachines,
    fieldOperations,
    fields,
    machines,
    nextId,
  } = useApp();

  const describeOperation = (operationId?: number) => {
    const operation = fieldOperations.find((item) => item.id === operationId);
    const field = fields.find((item) => item.id === operation?.field_id);
    if (!operation) return '-';
    return `${field?.name ?? 'Campo'} • ${operation.operation_type} • ${operation.operation_date}`;
  };

  return (
    <CrudTable<FieldOperationMachine>
      items={fieldOperationMachines}
      setItems={setFieldOperationMachines}
      nextId={nextId}
      actionLabel="Novo Vínculo de Máquina"
      dialogTitle={(editing) => editing ? 'Editar Vínculo de Máquina' : 'Novo Vínculo de Máquina'}
      createInitial={() => ({})}
      columns={[
        { label: 'Operação', render: (item) => <Typography variant="body2" fontWeight={500}>{describeOperation(item.field_operation_id)}</Typography> },
        { label: 'Máquina', render: (item) => machines.find((machine) => machine.id === item.machine_id)?.name ?? '-' },
        { label: 'Horas', align: 'right', render: (item) => item.hours_worked?.toLocaleString('pt-BR') ?? '-' },
        { label: 'Observação', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Operação</InputLabel>
            <Select
              value={String(form.field_operation_id ?? '')}
              label="Operação"
              onChange={(event) => setForm((current) => ({ ...current, field_operation_id: Number(event.target.value) }))}
            >
              {fieldOperations.map((operation) => (
                <MenuItem key={operation.id} value={String(operation.id)}>
                  {describeOperation(operation.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Máquina</InputLabel>
            <Select
              value={String(form.machine_id ?? '')}
              label="Máquina"
              onChange={(event) => setForm((current) => ({ ...current, machine_id: Number(event.target.value) }))}
            >
              {machines.map((machine) => (
                <MenuItem key={machine.id} value={String(machine.id)}>{machine.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Horas Trabalhadas"
              type="number"
              value={String(form.hours_worked ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, hours_worked: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
            <TextField
              label="Observação"
              value={form.observation ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, observation: event.target.value || undefined }))}
              fullWidth
            />
          </Stack>
        </>
      )}
      isSaveDisabled={(form) => !form.field_operation_id || !form.machine_id}
      emptyMessage="Nenhum vínculo de máquina cadastrado."
    />
  );
}
