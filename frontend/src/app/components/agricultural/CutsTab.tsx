import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import type { GridColDef } from '@mui/x-data-grid';
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
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
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

  const columns = useMemo<GridColDef<Cut>[]>(
    () => [
      {
        field: 'fieldName',
        headerName: 'Campo',
        flex: 1,
        minWidth: 150,
        valueGetter: (_, row) => getFieldName(row.fieldId),
        renderCell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {getFieldName(row.fieldId)}
          </Typography>
        ),
      },
      {
        field: 'productName',
        headerName: 'Produto',
        flex: 1,
        minWidth: 160,
        valueGetter: (_, row) => getProductName(row.productId),
      },
      {
        field: 'batchCode',
        headerName: 'Lote',
        flex: 1.2,
        minWidth: 190,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontFamily: 'monospace' }}
          >
            {row.batchCode ?? '-'}
          </Typography>
        ),
      },
      {
        field: 'cutNumber',
        headerName: 'Corte',
        type: 'number',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Chip
            label={`#${row.cutNumber ?? '-'}`}
            size="small"
            color="primary"
            sx={{ height: 20 }}
          />
        ),
      },
      {
        field: 'cutDate',
        headerName: 'Data',
        minWidth: 120,
        flex: 0.7,
        valueFormatter: (value) => fmtDate(value as string | undefined),
      },
      {
        field: 'daysSinceLastCut',
        headerName: 'Dias ult. corte',
        type: 'number',
        minWidth: 145,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value) =>
          value === undefined || value === null ? '-' : `${value} dias`,
      },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        flex: 0.7,
        valueFormatter: (value) =>
          value === 'CANCELED' ? 'Cancelado' : 'Concluido',
        renderCell: ({ row }) => {
          const isCanceled = row.status === 'CANCELED';

          return (
            <Chip
              label={isCanceled ? 'Cancelado' : 'Concluido'}
              size="small"
              color={isCanceled ? 'default' : 'success'}
              sx={{ height: 20 }}
            />
          );
        },
      },
      {
        field: 'quantity',
        headerName: 'Quantidade',
        type: 'number',
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value) => fmtQuantity(value as number | undefined),
      },
      {
        field: 'unitCost',
        headerName: 'Custo Unit.',
        type: 'number',
        minWidth: 130,
        align: 'right',
        headerAlign: 'right',
        valueFormatter: (value) =>
          value === undefined || value === null ? '-' : fmtBRL(value as number),
      },
      {
        field: 'actions',
        headerName: 'Acoes',
        width: 100,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        disableExport: true,
        renderCell: ({ row }) => {
          const isCanceled = row.status === 'CANCELED';

          return (
            <Tooltip title="Cancelar corte">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isCanceled || cancelCut.isPending}
                  onClick={() => {
                    void handleCancel(row);
                  }}
                >
                  <BlockIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    [cancelCut.isPending, catalog.products.byId, fields],
  );

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Corte"
        onAction={() => {
          setDialogOpen(true);
        }}
      />

      <AppDataGrid
        rows={sorted}
        columns={columns}
        loading={isLoading}
        emptyMessage="Nenhum corte lancado."
        exportFileName="cortes"
      />

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
