import { useEffect, useState } from 'react';
import {
  Box,
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
import type { InventoryMovement } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { StatBox } from '../shared/StatBox';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const MOVE_LABEL: Record<NonNullable<InventoryMovement['movement_type']>, string> = {
  PURCHASE_IN: 'Compra',
  PRODUCTION_IN: 'Producao',
  SALE_OUT: 'Venda',
  CONSUMPTION_OUT: 'Consumo',
  ADJUSTMENT_IN: 'Ajuste +',
  ADJUSTMENT_OUT: 'Ajuste -',
  TRANSFER_IN: 'Transferencia +',
  TRANSFER_OUT: 'Transferencia -',
};

const MOVE_COLOR: Record<NonNullable<InventoryMovement['movement_type']>, 'success' | 'error' | 'warning' | 'info'> = {
  PURCHASE_IN: 'success',
  PRODUCTION_IN: 'success',
  SALE_OUT: 'error',
  CONSUMPTION_OUT: 'warning',
  ADJUSTMENT_IN: 'info',
  ADJUSTMENT_OUT: 'warning',
  TRANSFER_IN: 'info',
  TRANSFER_OUT: 'info',
};

function createInitialMovement(): Partial<InventoryMovement> {
  return {
    movement_type: 'PRODUCTION_IN',
    movement_date: new Date().toISOString().split('T')[0],
  };
}

function MovementDialog({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing?: InventoryMovement;
  onSave: (data: Partial<InventoryMovement>) => void;
}) {
  const {
    inventoryBatches,
    products,
    financialTransactionItems,
    financialTransactions,
  } = useApp();
  const [form, setForm] = useState<Partial<InventoryMovement>>(createInitialMovement());

  useEffect(() => {
    setForm(editing ? { ...editing } : createInitialMovement());
  }, [editing, open]);

  const describeTransactionItem = (itemId?: number) => {
    const item = financialTransactionItems.find((entry) => entry.id === itemId);
    const transaction = financialTransactions.find((entry) => entry.id === item?.financial_transaction_id);
    if (!item) return '-';
    return `#${item.id} - ${transaction?.description ?? 'Transacao financeira'}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Movimentacao de Estoque' : 'Nova Movimentacao de Estoque'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Lote</InputLabel>
            <Select
              value={String(form.batch_id ?? '')}
              label="Lote"
              onChange={(event) =>
                setForm((current) => ({ ...current, batch_id: Number(event.target.value) }))
              }
            >
              {inventoryBatches.map((batch) => {
                const product = products.find((item) => item.id === batch.product_id);
                return (
                  <MenuItem key={batch.id} value={String(batch.id)}>
                    {batch.code} - {product?.name ?? 'Produto'}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.movement_type ?? 'PRODUCTION_IN')}
                label="Tipo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    movement_type: event.target.value as InventoryMovement['movement_type'],
                  }))
                }
              >
                {Object.entries(MOVE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Data"
              type="date"
              value={form.movement_date ?? ''}
              onChange={(event) =>
                setForm((current) => ({ ...current, movement_date: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Quantidade"
              type="number"
              value={String(form.quantity ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              fullWidth
            />
            <TextField
              label="Custo Unitario"
              type="number"
              value={String(form.unit_cost ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unit_cost: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              fullWidth
            />
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Item Financeiro</InputLabel>
            <Select
              value={String(form.financial_transaction_item_id ?? '')}
              label="Item Financeiro"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  financial_transaction_item_id: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
            >
              <MenuItem value="">-- Nenhum --</MenuItem>
              {financialTransactionItems.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {describeTransactionItem(item.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!form.batch_id || !form.movement_type || !form.quantity || !form.movement_date}
          onClick={() => onSave(form)}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function InventoryMovementsTab() {
  const {
    inventoryMovements,
    setInventoryMovements,
    inventoryBatches,
    products,
    financialTransactionItems,
    financialTransactions,
    nextId,
  } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryMovement | undefined>();

  const sorted = [...inventoryMovements].sort((left, right) =>
    (right.movement_date ?? '').localeCompare(left.movement_date ?? '')
  );

  const totalIn = sorted
    .filter((movement) => movement.movement_type?.endsWith('_IN'))
    .reduce((sum, movement) => sum + (movement.quantity ?? 0), 0);

  const totalOut = sorted
    .filter((movement) => movement.movement_type?.endsWith('_OUT'))
    .reduce((sum, movement) => sum + (movement.quantity ?? 0), 0);

  const describeTransactionItem = (itemId?: number) => {
    const item = financialTransactionItems.find((entry) => entry.id === itemId);
    const transaction = financialTransactions.find((entry) => entry.id === item?.financial_transaction_id);
    if (!item) return '-';
    return `#${item.id} - ${transaction?.description ?? 'Transacao financeira'}`;
  };

  const handleSave = (data: Partial<InventoryMovement>) => {
    setInventoryMovements((current) =>
      editing
        ? current.map((movement) =>
            movement.id === editing.id ? ({ ...movement, ...data } as InventoryMovement) : movement
          )
        : [...current, { id: nextId(current), ...data } as InventoryMovement]
    );
    setDialogOpen(false);
    setEditing(undefined);
  };

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (movement: InventoryMovement) => {
    setEditing(movement);
    setDialogOpen(true);
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Movimentacao" onAction={openCreate}>
        <StatBox label="Entradas" value={`${totalIn.toLocaleString('pt-BR')} un`} />
        <StatBox label="Saidas" value={`${totalOut.toLocaleString('pt-BR')} un`} color="#D32F2F" bgColor="#FFEBEE" />
        <StatBox label="Saldo Liquido" value={`${(totalIn - totalOut).toLocaleString('pt-BR')} un`} color="#1565C0" bgColor="#E3F2FD" />
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Lote</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Item Financeiro</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Custo Unit.</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((movement) => {
              const batch = inventoryBatches.find((item) => item.id === movement.batch_id);
              const product = products.find((item) => item.id === batch?.product_id);
              const total = (movement.quantity ?? 0) * (movement.unit_cost ?? 0);

              return (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {batch?.code ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{product?.name ?? '-'}</TableCell>
                  <TableCell>
                    {movement.movement_type && (
                      <Chip
                        label={MOVE_LABEL[movement.movement_type]}
                        size="small"
                        color={MOVE_COLOR[movement.movement_type]}
                        sx={{ height: 20 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{fmtDate(movement.movement_date)}</TableCell>
                  <TableCell>{describeTransactionItem(movement.financial_transaction_item_id)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {movement.quantity?.toLocaleString('pt-BR') ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{fmtBRL(movement.unit_cost ?? 0)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600} sx={{ color: total >= 0 ? 'success.main' : 'error.main' }}>
                      {fmtBRL(total)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => openEdit(movement)}
                      onDelete={() =>
                        setInventoryMovements((current) =>
                          current.filter((item) => item.id !== movement.id)
                        )
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <EmptyTableRow colSpan={9} message="Nenhuma movimentacao registrada." />
            )}
          </TableBody>
        </Table>
      </Card>

      <MovementDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(undefined);
        }}
        editing={editing}
        onSave={handleSave}
      />
    </Box>
  );
}
