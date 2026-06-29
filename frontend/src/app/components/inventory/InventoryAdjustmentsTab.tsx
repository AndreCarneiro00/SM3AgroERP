import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
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
  InventoryAdjustment,
  InventoryAdjustmentInput,
} from '../../../domains/inventory/model/entities';
import {
  selectInventoryMovementLabelById,
} from '../../../domains/inventory/selectors/selectors';
import {
  useInventoryCatalogData,
  useInventoryMutations,
} from '../../../domains/inventory/ui/hooks';
import {
  selectAdjustmentRootCauseLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

function createInitialAdjustment(): InventoryAdjustmentInput {
  return { type: 'POSITIVE' };
}

export function InventoryAdjustmentsTab() {
  const { inventoryAdjustments, inventoryMovements, catalog, isLoading } =
    useInventoryCatalogData();
  const {
    createInventoryAdjustment,
    updateInventoryAdjustment,
    deleteInventoryAdjustment,
  } = useInventoryMutations();
  const {
    catalog: masterDataCatalog,
    adjustmentRootCauses,
  } = useMasterDataCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryAdjustment | undefined>();
  const [form, setForm] = useState<InventoryAdjustmentInput>(
    createInitialAdjustment(),
  );

  const sortedAdjustments = useMemo(
    () =>
      [...inventoryAdjustments].sort(
        (left, right) => (right.id ?? 0) - (left.id ?? 0),
      ),
    [inventoryAdjustments],
  );

  const saving =
    createInventoryAdjustment.isPending ||
    updateInventoryAdjustment.isPending ||
    deleteInventoryAdjustment.isPending;

  useEffect(() => {
    if (!dialogOpen) return;

    setForm(
      editing
        ? {
            type: editing.type,
            rootCauseId: editing.rootCauseId,
            observation: editing.observation,
            inventoryMovementId: editing.inventoryMovementId,
          }
        : createInitialAdjustment(),
    );
  }, [dialogOpen, editing]);

  const getAdjustmentRootCauseName = (adjustmentRootCauseId?: number) =>
    selectAdjustmentRootCauseLabelById(
      masterDataCatalog,
      adjustmentRootCauseId,
    );

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (inventoryAdjustment: InventoryAdjustment) => {
    setEditing(inventoryAdjustment);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      await updateInventoryAdjustment.mutateAsync({
        id: editing.id,
        input: form,
      });
    } else {
      await createInventoryAdjustment.mutateAsync(form);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <>
      <PageHeader actionLabel="Novo Ajuste" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Causa Raiz</TableCell>
              <TableCell>Movimento</TableCell>
              <TableCell>Observacao</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedAdjustments.map((inventoryAdjustment) => (
              <TableRow key={inventoryAdjustment.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {inventoryAdjustment.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getAdjustmentRootCauseName(inventoryAdjustment.rootCauseId)}
                </TableCell>
                <TableCell>
                  {selectInventoryMovementLabelById(
                    catalog,
                    inventoryAdjustment.inventoryMovementId,
                  )}
                </TableCell>
                <TableCell>{inventoryAdjustment.observation ?? '-'}</TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(inventoryAdjustment)}
                    onDelete={() => {
                      void deleteInventoryAdjustment.mutateAsync(
                        inventoryAdjustment.id,
                      );
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {sortedAdjustments.length === 0 && (
              <EmptyTableRow
                colSpan={5}
                message={
                  isLoading
                    ? 'Carregando ajustes de estoque...'
                    : 'Nenhum ajuste de estoque cadastrado.'
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
          {editing ? 'Editar Ajuste de Estoque' : 'Novo Ajuste de Estoque'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={String(form.type ?? 'POSITIVE')}
                  label="Tipo"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      type: event.target.value as InventoryAdjustment['type'],
                    }))
                  }
                >
                  <MenuItem value="POSITIVE">POSITIVE</MenuItem>
                  <MenuItem value="NEGATIVE">NEGATIVE</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel>Causa Raiz</InputLabel>
                <Select
                  value={String(form.rootCauseId ?? '')}
                  label="Causa Raiz"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      rootCauseId: Number(event.target.value),
                    }))
                  }
                >
                  {adjustmentRootCauses.map((adjustmentRootCause) => (
                    <MenuItem
                      key={adjustmentRootCause.id}
                      value={String(adjustmentRootCause.id)}
                    >
                      {adjustmentRootCause.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth size="small">
              <InputLabel>Movimento</InputLabel>
              <Select
                value={String(form.inventoryMovementId ?? '')}
                label="Movimento"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    inventoryMovementId: Number(event.target.value),
                  }))
                }
              >
                {inventoryMovements.map((movement) => (
                  <MenuItem key={movement.id} value={String(movement.id)}>
                    {selectInventoryMovementLabelById(catalog, movement.id)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              !form.type || !form.rootCauseId || !form.inventoryMovementId || saving
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
