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
import {
  selectCutLabelById,
  selectFieldOperationLabelById,
} from '../../../domains/agricultural/selectors/selectors';
import { useAgriculturalCatalogData } from '../../../domains/agricultural/ui/hooks';
import {
  selectFinancialTransactionItemLabelById,
} from '../../../domains/financial/selectors/selectors';
import { useFinancialCatalogData } from '../../../domains/financial/ui/hooks';
import type {
  InventoryAdjustment,
  InventoryAdjustmentInput,
  InventoryBatch,
  InventoryMovement,
  InventoryMovementInput,
} from '../../../domains/inventory/model/entities';
import {
  useInventoryCatalogData,
  useInventoryMutations,
} from '../../../domains/inventory/ui/hooks';
import {
  selectAdjustmentRootCauseLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
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

const ADJUSTMENT_TYPE_LABEL: Record<InventoryAdjustment['type'], string> = {
  POSITIVE: 'Entrada de ajuste',
  NEGATIVE: 'Saida de ajuste',
};

interface AdjustmentForm {
  batchId?: number;
  type: InventoryAdjustment['type'];
  quantity?: number;
  unitCost?: number;
  movementDate?: string;
  rootCauseId?: number;
  observation?: string;
}

interface AdjustmentEditTarget {
  movement: InventoryMovement;
  adjustment?: InventoryAdjustment;
}

function createInitialAdjustmentForm(): AdjustmentForm {
  return {
    type: 'POSITIVE',
    movementDate: new Date().toISOString().split('T')[0],
  };
}

function toAdjustmentTypeFromMovement(
  movement?: InventoryMovement,
): InventoryAdjustment['type'] {
  return movement?.movementType === 'ADJUSTMENT_OUT' ? 'NEGATIVE' : 'POSITIVE';
}

function toMovementTypeFromAdjustment(
  type: InventoryAdjustment['type'],
): InventoryMovement['movementType'] {
  return type === 'NEGATIVE' ? 'ADJUSTMENT_OUT' : 'ADJUSTMENT_IN';
}

function isAdjustmentMovement(movement?: InventoryMovement) {
  return (
    movement?.movementType === 'ADJUSTMENT_IN' ||
    movement?.movementType === 'ADJUSTMENT_OUT'
  );
}

interface AdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: AdjustmentEditTarget;
  inventoryBatches: InventoryBatch[];
  adjustmentRootCauses: Array<{ id: number; name: string }>;
  getProductName: (productId?: number) => string;
  onSave: (data: AdjustmentForm) => void | Promise<void>;
  saving: boolean;
}

function AdjustmentDialog({
  open,
  onClose,
  editing,
  inventoryBatches,
  adjustmentRootCauses,
  getProductName,
  onSave,
  saving,
}: AdjustmentDialogProps) {
  const [form, setForm] = useState<AdjustmentForm>(
    createInitialAdjustmentForm(),
  );

  useEffect(() => {
    if (!open) return;

    setForm(
      editing
        ? {
            batchId: editing.movement.batchId,
            type:
              editing.adjustment?.type ??
              toAdjustmentTypeFromMovement(editing.movement),
            quantity: editing.movement.quantity,
            unitCost: editing.movement.unitCost,
            movementDate: editing.movement.movementDate,
            rootCauseId: editing.adjustment?.rootCauseId,
            observation: editing.adjustment?.observation,
          }
        : createInitialAdjustmentForm(),
    );
  }, [editing, open]);

  const isInvalid =
    !form.batchId ||
    !form.rootCauseId ||
    !form.movementDate ||
    !form.quantity ||
    form.quantity <= 0 ||
    saving;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Ajuste de Estoque' : 'Novo Ajuste de Estoque'}
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={form.type}
                label="Tipo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as InventoryAdjustment['type'],
                  }))
                }
              >
                {Object.entries(ADJUSTMENT_TYPE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Causa</InputLabel>
              <Select
                value={String(form.rootCauseId ?? '')}
                label="Causa"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rootCauseId: Number(event.target.value),
                  }))
                }
              >
                {adjustmentRootCauses.map((rootCause) => (
                  <MenuItem key={rootCause.id} value={String(rootCause.id)}>
                    {rootCause.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
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
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isInvalid}
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
  const { catalog: financialCatalog } = useFinancialCatalogData();
  const {
    catalog: agriculturalCatalog,
    fieldOperationItems,
    productionBatches,
  } = useAgriculturalCatalogData();
  const {
    inventoryAdjustments,
    inventoryBatches,
    inventoryMovements,
    isLoading,
  } = useInventoryCatalogData();
  const {
    createInventoryAdjustment,
    createInventoryMovement,
    deleteInventoryAdjustment,
    deleteInventoryMovement,
    updateInventoryAdjustment,
    updateInventoryMovement,
  } = useInventoryMutations();
  const {
    catalog: masterDataCatalog,
    adjustmentRootCauses,
  } = useMasterDataCatalogData();
  const { catalog: productsCatalog } = useProductsCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdjustmentEditTarget | undefined>();

  const batchesById = useMemo(
    () => new Map(inventoryBatches.map((batch) => [batch.id, batch])),
    [inventoryBatches],
  );

  const adjustmentsByMovementId = useMemo(
    () =>
      new Map(
        inventoryAdjustments
          .filter((adjustment) => adjustment.inventoryMovementId)
          .map((adjustment) => [
            adjustment.inventoryMovementId as number,
            adjustment,
          ]),
      ),
    [inventoryAdjustments],
  );

  const productionBatchesByMovementId = useMemo(
    () =>
      new Map(
        productionBatches
          .filter((batch) => batch.inventoryMovementId)
          .map((batch) => [batch.inventoryMovementId as number, batch]),
      ),
    [productionBatches],
  );

  const fieldOperationItemsByMovementId = useMemo(
    () =>
      new Map(
        fieldOperationItems
          .filter((item) => item.inventoryMovementId)
          .map((item) => [item.inventoryMovementId as number, item]),
      ),
    [fieldOperationItems],
  );

  const getProductName = (productId?: number) =>
    productsCatalog.products.byId[productId ?? -1]?.name ?? '-';

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
    createInventoryAdjustment.isPending ||
    createInventoryMovement.isPending ||
    deleteInventoryAdjustment.isPending ||
    deleteInventoryMovement.isPending ||
    updateInventoryAdjustment.isPending ||
    updateInventoryMovement.isPending;

  const openCreateAdjustment = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEditAdjustment = (movement: InventoryMovement) => {
    setEditing({
      movement,
      adjustment: adjustmentsByMovementId.get(movement.id),
    });
    setDialogOpen(true);
  };

  const handleSaveAdjustment = async (form: AdjustmentForm) => {
    const movementInput: InventoryMovementInput = {
      batchId: form.batchId,
      movementType: toMovementTypeFromAdjustment(form.type),
      quantity: form.quantity,
      unitCost: form.unitCost,
      movementDate: form.movementDate,
    };

    if (editing) {
      await updateInventoryMovement.mutateAsync({
        id: editing.movement.id,
        input: movementInput,
      });

      const adjustmentInput: InventoryAdjustmentInput = {
        type: form.type,
        rootCauseId: form.rootCauseId,
        observation: form.observation,
        inventoryMovementId: editing.movement.id,
      };

      if (editing.adjustment) {
        await updateInventoryAdjustment.mutateAsync({
          id: editing.adjustment.id,
          input: adjustmentInput,
        });
      } else {
        await createInventoryAdjustment.mutateAsync(adjustmentInput);
      }
    } else {
      const createdMovement =
        await createInventoryMovement.mutateAsync(movementInput);

      await createInventoryAdjustment.mutateAsync({
        type: form.type,
        rootCauseId: form.rootCauseId,
        observation: form.observation,
        inventoryMovementId: createdMovement.id,
      });
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDeleteAdjustment = async (movement: InventoryMovement) => {
    const adjustment = adjustmentsByMovementId.get(movement.id);

    if (adjustment) {
      await deleteInventoryAdjustment.mutateAsync(adjustment.id);
    }

    await deleteInventoryMovement.mutateAsync(movement.id);
  };

  const getMovementOrigin = (movement: InventoryMovement) => {
    const adjustment = adjustmentsByMovementId.get(movement.id);

    if (adjustment) {
      return selectAdjustmentRootCauseLabelById(
        masterDataCatalog,
        adjustment.rootCauseId,
      );
    }

    const productionBatch = productionBatchesByMovementId.get(movement.id);

    if (productionBatch) {
      return `Corte ${selectCutLabelById(
        agriculturalCatalog,
        productionBatch.cutId,
      )}`;
    }

    const fieldOperationItem = fieldOperationItemsByMovementId.get(movement.id);

    if (fieldOperationItem) {
      return selectFieldOperationLabelById(
        agriculturalCatalog,
        fieldOperationItem.fieldOperationId,
      );
    }

    if (movement.financialTransactionItemId) {
      return selectFinancialTransactionItemLabelById(
        financialCatalog,
        movement.financialTransactionItemId,
      );
    }

    if (movement.movementType?.startsWith('TRANSFER')) {
      return 'Transferencia';
    }

    return 'Movimentacao gerada';
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Ajuste" onAction={openCreateAdjustment}>
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
              <TableCell>Origem</TableCell>
              <TableCell>Observacao</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Custo Unit.</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((movement) => {
              const batch = batchesById.get(movement.batchId ?? -1);
              const adjustment = adjustmentsByMovementId.get(movement.id);
              const total = (movement.quantity ?? 0) * (movement.unitCost ?? 0);
              const canManageAdjustment = isAdjustmentMovement(movement);

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
                  <TableCell>{getMovementOrigin(movement)}</TableCell>
                  <TableCell>{adjustment?.observation ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {movement.quantity?.toLocaleString('pt-BR') ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {fmtBRL(movement.unitCost ?? 0)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {fmtBRL(total)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {canManageAdjustment ? (
                      <RowActions
                        disabled={saving}
                        deleteConfirmMessage="Excluir ajuste e movimentacao vinculada?"
                        onEdit={() => openEditAdjustment(movement)}
                        onDelete={() => {
                          void handleDeleteAdjustment(movement);
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <EmptyTableRow
                colSpan={10}
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

      <AdjustmentDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditing(undefined);
        }}
        editing={editing}
        inventoryBatches={inventoryBatches}
        adjustmentRootCauses={adjustmentRootCauses}
        getProductName={getProductName}
        onSave={handleSaveAdjustment}
        saving={saving}
      />
    </Box>
  );
}
