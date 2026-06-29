import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type {
  InventoryBatch,
  InventoryBatchInput,
} from '../../../domains/inventory/model/entities';
import {
  useInventoryCatalogData,
  useInventoryMutations,
} from '../../../domains/inventory/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function createInitialBatch(): InventoryBatchInput {
  return {
    status: 'ACTIVE',
    batchDate: new Date().toISOString().split('T')[0],
    quantity: 0,
  };
}

export function InventoryBatchesTab() {
  const { inventoryBatches, isLoading } = useInventoryCatalogData();
  const {
    createInventoryBatch,
    updateInventoryBatch,
    deleteInventoryBatch,
  } = useInventoryMutations();
  const { catalog, products } = useProductsCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryBatch | undefined>();
  const [form, setForm] = useState<InventoryBatchInput>(createInitialBatch());

  const getProductName = (productId?: number) =>
    catalog.products.byId[productId ?? -1]?.name ?? '-';

  const sortedBatches = useMemo(
    () =>
      [...inventoryBatches].sort((left, right) =>
        (right.batchDate ?? '').localeCompare(left.batchDate ?? ''),
      ),
    [inventoryBatches],
  );

  const saving =
    createInventoryBatch.isPending ||
    updateInventoryBatch.isPending ||
    deleteInventoryBatch.isPending;

  useEffect(() => {
    if (!dialogOpen) return;

    setForm(
      editing
        ? {
            productId: editing.productId,
            code: editing.code,
            batchDate: editing.batchDate,
            status: editing.status,
            unitCost: editing.unitCost,
            quantity: editing.quantity,
          }
        : createInitialBatch(),
    );
  }, [dialogOpen, editing]);

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (inventoryBatch: InventoryBatch) => {
    setEditing(inventoryBatch);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await updateInventoryBatch.mutateAsync({ id: editing.id, input: form });
    } else {
      await createInventoryBatch.mutateAsync(form);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <>
      <PageHeader actionLabel="Novo Lote de Estoque" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Codigo</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Custo Unit.</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBatches.map((inventoryBatch) => (
              <TableRow key={inventoryBatch.id}>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {inventoryBatch.code ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell>{getProductName(inventoryBatch.productId)}</TableCell>
                <TableCell>{inventoryBatch.batchDate ?? '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={inventoryBatch.status ?? '-'}
                    size="small"
                    color={
                      inventoryBatch.status === 'ACTIVE' ? 'success' : 'default'
                    }
                    sx={{ height: 20 }}
                  />
                </TableCell>
                <TableCell align="right">
                  {inventoryBatch.quantity?.toLocaleString('pt-BR') ?? '-'}
                </TableCell>
                <TableCell align="right">
                  {inventoryBatch.unitCost
                    ? fmtBRL(inventoryBatch.unitCost)
                    : '-'}
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(inventoryBatch)}
                    onDelete={() => {
                      void deleteInventoryBatch.mutateAsync(inventoryBatch.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {sortedBatches.length === 0 && (
              <EmptyTableRow
                colSpan={7}
                message={
                  isLoading
                    ? 'Carregando lotes de estoque...'
                    : 'Nenhum lote de estoque cadastrado.'
                }
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing ? 'Editar Lote de Estoque' : 'Novo Lote de Estoque'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="Codigo"
                value={form.code ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value || undefined,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Data do Lote"
                type="date"
                value={form.batchDate ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    batchDate: event.target.value || undefined,
                  }))
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Produto</InputLabel>
              <Select
                value={String(form.productId ?? '')}
                label="Produto"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    productId: Number(event.target.value),
                  }))
                }
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={String(form.status ?? 'ACTIVE')}
                  label="Status"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as InventoryBatch['status'],
                    }))
                  }
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
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    quantity: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Custo Unitario"
                type="number"
                value={String(form.unitCost ?? '')}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    unitCost: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              !form.code ||
              !form.productId ||
              !form.batchDate ||
              form.quantity === undefined ||
              saving
            }
            onClick={() => {
              void handleSave();
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
