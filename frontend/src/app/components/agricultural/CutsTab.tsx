import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import type {
  Cut,
  CutInput,
} from '../../../domains/agricultural/model/entities';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { extractApiErrorMessage } from '../../../core/http/client';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { ResponsiveTableFrame } from '../shared/table';
import { CutDialog } from './CutDialog';

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtQuantity = (value?: number) =>
  value === undefined ? '-' : value.toLocaleString('pt-BR');

export function CutsTab() {
  const { cuts, fields, isLoading } = useAgriculturalCatalogData();
  const { createCut, cancelCut } = useAgriculturalMutations();
  const { catalog, products } = useProductsCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...cuts].sort((left, right) =>
        (right.cutDate ?? '').localeCompare(left.cutDate ?? ''),
      ),
    [cuts],
  );

  const getProductName = (productId?: number) =>
    catalog.products.byId[productId ?? -1]?.name ?? '-';

  const getFieldName = (fieldId?: number) =>
    fields.find((item) => item.id === fieldId)?.name ?? '-';

  const handleSave = async (input: CutInput) => {
    try {
      await createCut.mutateAsync(input);
      setDialogOpen(false);
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ?? 'Nao foi possivel lancar o corte.',
      );
    }
  };

  const handleCancel = async (cut: Cut) => {
    if (!window.confirm('Cancelar este corte e gerar ajuste compensatorio?')) {
      return;
    }

    try {
      await cancelCut.mutateAsync(cut.id);
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ?? 'Nao foi possivel cancelar o corte.',
      );
    }
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Corte"
        onAction={() => {
          setDialogOpen(true);
        }}
      />

      <ResponsiveTableFrame minWidth={1180} maxHeight="calc(115vh - 260px)">
        <TableHead>
          <TableRow>
            <TableCell>Campo</TableCell>
            <TableCell>Produto</TableCell>
            <TableCell>Lote</TableCell>
            <TableCell>Corte</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Quantidade</TableCell>
            <TableCell align="right">Custo Unit.</TableCell>
            <TableCell align="center">Acoes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((cut) => {
            const isCanceled = cut.status === 'CANCELED';

            return (
              <TableRow key={cut.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {getFieldName(cut.fieldId)}
                  </Typography>
                </TableCell>
                <TableCell>{getProductName(cut.productId)}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {cut.batchCode ?? '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`#${cut.cutNumber ?? '-'}`}
                    size="small"
                    color="primary"
                    sx={{ height: 20 }}
                  />
                </TableCell>
                <TableCell>{fmtDate(cut.cutDate)}</TableCell>
                <TableCell>
                  <Chip
                    label={isCanceled ? 'Cancelado' : 'Concluido'}
                    size="small"
                    color={isCanceled ? 'default' : 'success'}
                    sx={{ height: 20 }}
                  />
                </TableCell>
                <TableCell align="right">{fmtQuantity(cut.quantity)}</TableCell>
                <TableCell align="right">
                  {cut.unitCost === undefined ? '-' : fmtBRL(cut.unitCost)}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Cancelar corte">
                    <span>
                      <IconButton
                        size="small"
                        color="error"
                        disabled={isCanceled || cancelCut.isPending}
                        onClick={() => {
                          void handleCancel(cut);
                        }}
                      >
                        <BlockIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
          {sorted.length === 0 && (
            <EmptyTableRow
              colSpan={9}
              message={
                isLoading ? 'Carregando cortes...' : 'Nenhum corte lancado.'
              }
            />
          )}
        </TableBody>
      </ResponsiveTableFrame>

      <CutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fields={fields}
        products={products}
        saving={createCut.isPending}
        onSave={(input) => {
          void handleSave(input);
        }}
      />
    </Box>
  );
}
