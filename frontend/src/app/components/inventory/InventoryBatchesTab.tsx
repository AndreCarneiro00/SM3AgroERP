import {
  Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { InventoryBatch } from '../../data/types';

const fmtBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function InventoryBatchesTab() {
  const { inventoryBatches, setInventoryBatches, products, nextId } = useApp();

  return (
    <CrudTable<InventoryBatch>
      items={inventoryBatches}
      setItems={setInventoryBatches}
      nextId={nextId}
      actionLabel="Novo Lote de Estoque"
      dialogTitle={(editing) => editing ? 'Editar Lote de Estoque' : 'Novo Lote de Estoque'}
      createInitial={() => ({
        status: 'ACTIVE',
        batch_date: new Date().toISOString().split('T')[0],
        quantity: 0,
      })}
      columns={[
        {
          label: 'Código',
          render: (item) => (
            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
              {item.code ?? '-'}
            </Typography>
          ),
        },
        { label: 'Produto', render: (item) => products.find((product) => product.id === item.product_id)?.name ?? '-' },
        { label: 'Data', render: (item) => item.batch_date ?? '-' },
        {
          label: 'Status',
          render: (item) => (
            <Chip label={item.status ?? '-'} size="small" color={item.status === 'ACTIVE' ? 'success' : 'default'} sx={{ height: 20 }} />
          ),
        },
        { label: 'Quantidade', align: 'right', render: (item) => item.quantity?.toLocaleString('pt-BR') ?? '-' },
        { label: 'Custo Unit.', align: 'right', render: (item) => item.unit_cost ? fmtBRL(item.unit_cost) : '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Código"
              value={form.code ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
              fullWidth
            />
            <TextField
              label="Data do Lote"
              type="date"
              value={form.batch_date ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, batch_date: event.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
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
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={String(form.status ?? 'ACTIVE')}
                label="Status"
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InventoryBatch['status'] }))}
              >
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="CONSUMED">CONSUMED</MenuItem>
                <MenuItem value="SOLD">SOLD</MenuItem>
                <MenuItem value="CANCELED">CANCELED</MenuItem>
              </Select>
            </FormControl>
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
          </Stack>
        </>
      )}
      isSaveDisabled={(form) => !form.code || !form.product_id || !form.batch_date || form.quantity === undefined}
      emptyMessage="Nenhum lote de estoque cadastrado."
      sortItems={(items) => [...items].sort((left, right) => (right.batch_date ?? '').localeCompare(left.batch_date ?? ''))}
    />
  );
}
