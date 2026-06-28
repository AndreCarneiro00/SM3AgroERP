import {
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { FieldOperationItem } from '../../data/types';

const fmtBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function FieldOperationItemsTab() {
  const {
    fieldOperationItems,
    setFieldOperationItems,
    fieldOperations,
    fields,
    products,
    inventoryMovements,
    nextId,
  } = useApp();

  const describeOperation = (operationId?: number) => {
    const operation = fieldOperations.find((item) => item.id === operationId);
    const field = fields.find((item) => item.id === operation?.field_id);
    if (!operation) return '-';
    return `${field?.name ?? 'Campo'} • ${operation.operation_type} • ${operation.operation_date}`;
  };

  return (
    <CrudTable<FieldOperationItem>
      items={fieldOperationItems}
      setItems={setFieldOperationItems}
      nextId={nextId}
      actionLabel="Novo Item de Operação"
      dialogTitle={(editing) => editing ? 'Editar Item de Operação' : 'Novo Item de Operação'}
      createInitial={() => ({})}
      columns={[
        { label: 'Operação', render: (item) => <Typography variant="body2" fontWeight={500}>{describeOperation(item.field_operation_id)}</Typography> },
        { label: 'Produto', render: (item) => products.find((product) => product.id === item.product_id)?.name ?? '-' },
        { label: 'Quantidade', align: 'right', render: (item) => item.quantity?.toLocaleString('pt-BR') ?? '-' },
        { label: 'Custo Unit.', align: 'right', render: (item) => item.unit_cost ? fmtBRL(item.unit_cost) : '-' },
        { label: 'Valor', align: 'right', render: (item) => item.amount ? fmtBRL(item.amount) : '-' },
        { label: 'Movimento', render: (item) => item.inventory_movement_id ? `#${item.inventory_movement_id}` : '-' },
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
            <InputLabel>Produto</InputLabel>
            <Select
              value={String(form.product_id ?? '')}
              label="Produto"
              onChange={(event) => setForm((current) => ({ ...current, product_id: Number(event.target.value) }))}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={String(product.id)}>{product.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Quantidade"
              type="number"
              value={String(form.quantity ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
            <TextField
              label="Custo Unitário"
              type="number"
              value={String(form.unit_cost ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, unit_cost: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
            <TextField
              label="Valor"
              type="number"
              value={String(form.amount ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
          </Stack>
          <FormControl fullWidth size="small">
            <InputLabel>Movimento de Estoque</InputLabel>
            <Select
              value={String(form.inventory_movement_id ?? '')}
              label="Movimento de Estoque"
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
      isSaveDisabled={(form) => !form.field_operation_id || !form.product_id || !form.quantity || !form.inventory_movement_id}
      emptyMessage="Nenhum item de operação cadastrado."
    />
  );
}
