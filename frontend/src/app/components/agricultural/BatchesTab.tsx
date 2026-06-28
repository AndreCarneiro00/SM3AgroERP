import {
  FormControl, InputLabel, MenuItem, Select, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { ProductionBatch } from '../../data/types';

export function BatchesTab() {
  const {
    productionBatches,
    setProductionBatches,
    inventoryBatches,
    products,
    cuts,
    fields,
    nextId,
  } = useApp();

  return (
    <CrudTable<ProductionBatch>
      items={productionBatches}
      setItems={setProductionBatches}
      nextId={nextId}
      actionLabel="Novo Lote de Produção"
      dialogTitle={(editing) => editing ? 'Editar Lote de Produção' : 'Novo Lote de Produção'}
      createInitial={() => ({})}
      columns={[
        {
          label: 'Lote de Estoque',
          render: (item) => {
            const inventoryBatch = inventoryBatches.find((batch) => batch.id === item.inventory_batch_id);
            const product = products.find((entry) => entry.id === inventoryBatch?.product_id);
            return (
              <Typography variant="body2" fontWeight={500}>
                {inventoryBatch?.code ?? '-'} {product ? `• ${product.name}` : ''}
              </Typography>
            );
          },
        },
        {
          label: 'Corte',
          render: (item) => {
            const cut = cuts.find((entry) => entry.id === item.cut_id);
            const field = fields.find((entry) => entry.id === cut?.field_id);
            return cut ? `${field?.name ?? 'Campo'} • #${cut.cut_number}` : '-';
          },
        },
        { label: 'Qualidade', render: (item) => item.quality_grade ?? '-' },
        { label: 'Observação', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Lote de Estoque</InputLabel>
            <Select
              value={String(form.inventory_batch_id ?? '')}
              label="Lote de Estoque"
              onChange={(event) => setForm((current) => ({ ...current, inventory_batch_id: Number(event.target.value) }))}
            >
              {inventoryBatches.map((batch) => {
                const product = products.find((entry) => entry.id === batch.product_id);
                return (
                  <MenuItem key={batch.id} value={String(batch.id)}>
                    {batch.code} — {product?.name ?? 'Produto'}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Corte</InputLabel>
            <Select
              value={String(form.cut_id ?? '')}
              label="Corte"
              onChange={(event) => setForm((current) => ({ ...current, cut_id: Number(event.target.value) }))}
            >
              {cuts.map((cut) => {
                const field = fields.find((entry) => entry.id === cut.field_id);
                return (
                  <MenuItem key={cut.id} value={String(cut.id)}>
                    {field?.name ?? 'Campo'} — Corte #{cut.cut_number}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            label="Qualidade"
            value={form.quality_grade ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, quality_grade: event.target.value || undefined }))}
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
      isSaveDisabled={(form) => !form.inventory_batch_id || !form.cut_id}
      emptyMessage="Nenhum lote de produção cadastrado."
    />
  );
}
