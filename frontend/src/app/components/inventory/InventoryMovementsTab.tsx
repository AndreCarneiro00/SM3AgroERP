import { useEffect, useMemo, useState } from 'react';
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
import type {
  FinancialCatalog,
  FinancialTransactionItem,
} from '../../../domains/financial/model/entities';
import {
  selectFinancialTransactionItemLabelById,
} from '../../../domains/financial/selectors/selectors';
import { useFinancialCatalogData } from '../../../domains/financial/ui/hooks';
import type {
  InventoryBatch,
  InventoryMovement,
  InventoryMovementInput,
} from '../../../domains/inventory/model/entities';
import {
  useInventoryCatalogData,
  useInventoryMutations,
} from '../../../domains/inventory/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { StatBox } from '../shared/StatBox';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const MOVE_LABEL: Record<NonNullable<InventoryMovement['movementType']>, string> = {
  PURCHASE_IN: 'Compra',
  PRODUCTION_IN: 'Producao',
  SALE_OUT: 'Venda',
  CONSUMPTION_OUT: 'Consumo',
  ADJUSTMENT_IN: 'Ajuste +',
  ADJUSTMENT_OUT: 'Ajuste -',
  TRANSFER_IN: 'Transferencia +',
  TRANSFER_OUT: 'Transferencia -',
};

const MOVE_COLOR: Record<
  NonNullable<InventoryMovement['movementType']>,
  'success' | 'error' | 'warning' | 'info'
> = {
  PURCHASE_IN: 'success',
  PRODUCTION_IN: 'success',
  SALE_OUT: 'error',
  CONSUMPTION_OUT: 'warning',
  ADJUSTMENT_IN: 'info',
  ADJUSTMENT_OUT: 'warning',
  TRANSFER_IN: 'info',
  TRANSFER_OUT: 'info',
};

function createInitialMovement(): InventoryMovementInput {
  return {
    movementType: 'PRODUCTION_IN',
    movementDate: new Date().toISOString().split('T')[0],
  };
}

interface MovementDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: InventoryMovement;
  inventoryBatches: InventoryBatch[];
  financialCatalog: FinancialCatalog;
  financialTransactionItems: FinancialTransactionItem[];
  getProductName: (productId?: number) => string;
  onSave: (data: InventoryMovementInput) => void | Promise<void>;
  saving: boolean;
}

function MovementDialog({
  open,
  onClose,
  editing,
  inventoryBatches,
  financialCatalog,
  financialTransactionItems,
  getProductName,
  onSave,
  saving,
}: MovementDialogProps) {
  const [form, setForm] = useState<InventoryMovementInput>(createInitialMovement());

  useEffect(() => {
    setForm(
      editing
        ? {
            batchId: editing.batchId,
            movementType: editing.movementType,
            quantity: editing.quantity,
            unitCost: editing.unitCost,
            movementDate: editing.movementDate,
            financialTransactionItemId: editing.financialTransactionItemId,
          }
        : createInitialMovement(),
    );
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editing
          ? 'Editar Movimentacao de Estoque'
          : 'Nova Movimentacao de Estoque'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Lote</InputLabel>
            <Select
              value={String(form.batchId ?? '')}
              label="Lote"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  batchId: Number(event.target.value),
                }))
              }
            >
              {inventoryBatches.map((batch) => (
                <MenuItem key={batch.id} value={String(batch.id)}>
                  {batch.code} - {getProductName(batch.productId)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={String(form.movementType ?? 'PRODUCTION_IN')}
                label="Tipo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    movementType: event.target.value as InventoryMovement['movementType'],
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
              value={form.movementDate ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  movementDate: event.target.value || undefined,
                }))
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

          <FormControl fullWidth size="small">
            <InputLabel>Item Financeiro</InputLabel>
            <Select
              value={String(form.financialTransactionItemId ?? '')}
              label="Item Financeiro"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  financialTransactionItemId: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
            >
              <MenuItem value="">-- Nenhum --</MenuItem>
              {financialTransactionItems.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {selectFinancialTransactionItemLabelById(
                    financialCatalog,
                    item.id,
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={
            !form.batchId ||
            !form.movementType ||
            !form.quantity ||
            !form.movementDate ||
            saving
          }
          onClick={() => {
            void onSave(form);
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function InventoryMovementsTab() {
  const { catalog: financialCatalog, financialTransactionItems } =
    useFinancialCatalogData();
  const { inventoryMovements, inventoryBatches, isLoading } =
    useInventoryCatalogData();
  const {
    createInventoryMovement,
    updateInventoryMovement,
    deleteInventoryMovement,
  } = useInventoryMutations();
  const { catalog } = useProductsCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryMovement | undefined>();

  const getProductName = (productId?: number) =>
    catalog.products.byId[productId ?? -1]?.name ?? '-';

  const sorted = useMemo(
    () =>
      [...inventoryMovements].sort((left, right) =>
        (right.movementDate ?? '').localeCompare(left.movementDate ?? ''),
      ),
    [inventoryMovements],
  );

  const totalIn = sorted
    .filter((movement) => movement.movementType?.endsWith('_IN'))
    .reduce((sum, movement) => sum + (movement.quantity ?? 0), 0);

  const totalOut = sorted
    .filter((movement) => movement.movementType?.endsWith('_OUT'))
    .reduce((sum, movement) => sum + (movement.quantity ?? 0), 0);

  const saving =
    createInventoryMovement.isPending ||
    updateInventoryMovement.isPending ||
    deleteInventoryMovement.isPending;

  const handleSave = async (input: InventoryMovementInput) => {
    if (editing) {
      await updateInventoryMovement.mutateAsync({ id: editing.id, input });
    } else {
      await createInventoryMovement.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Movimentacao"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <StatBox label="Entradas" value={`${totalIn.toLocaleString('pt-BR')} un`} />
        <StatBox
          label="Saidas"
          value={`${totalOut.toLocaleString('pt-BR')} un`}
          color="#D32F2F"
          bgColor="#FFEBEE"
        />
        <StatBox
          label="Saldo Liquido"
          value={`${(totalIn - totalOut).toLocaleString('pt-BR')} un`}
          color="#1565C0"
          bgColor="#E3F2FD"
        />
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
              const batch = inventoryBatches.find(
                (item) => item.id === movement.batchId,
              );
              const total = (movement.quantity ?? 0) * (movement.unitCost ?? 0);

              return (
                <TableRow key={movement.id}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ fontFamily: 'monospace' }}
                    >
                      {batch?.code ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getProductName(batch?.productId)}</TableCell>
                  <TableCell>
                    {movement.movementType && (
                      <Chip
                        label={MOVE_LABEL[movement.movementType]}
                        size="small"
                        color={MOVE_COLOR[movement.movementType]}
                        sx={{ height: 20 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{fmtDate(movement.movementDate)}</TableCell>
                  <TableCell>
                    {selectFinancialTransactionItemLabelById(
                      financialCatalog,
                      movement.financialTransactionItemId,
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {movement.quantity?.toLocaleString('pt-BR') ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {fmtBRL(movement.unitCost ?? 0)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: total >= 0 ? 'success.main' : 'error.main' }}
                    >
                      {fmtBRL(total)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => {
                        setEditing(movement);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        void deleteInventoryMovement.mutateAsync(movement.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <EmptyTableRow
                colSpan={9}
                message={
                  isLoading
                    ? 'Carregando movimentacoes de estoque...'
                    : 'Nenhuma movimentacao registrada.'
                }
              />
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
        inventoryBatches={inventoryBatches}
        financialCatalog={financialCatalog}
        financialTransactionItems={financialTransactionItems}
        getProductName={getProductName}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
