import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type {
  Counterparty,
  CounterpartyInput,
  CounterpartyRow,
} from '../../../domains/master-data/model/entities';
import {
  useMasterDataCatalogData,
  useMasterDataMutations,
} from '../../../domains/master-data/ui/hooks';
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { CounterpartyDialog } from './CounterpartyDialog';

export function CounterpartiesTab() {
  const {
    counterparties,
    counterpartyRows,
    counterpartyTypes,
    segments,
  } = useMasterDataCatalogData();
  const {
    createCounterparty,
    deleteCounterparty,
    updateCounterparty,
  } = useMasterDataMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Counterparty | undefined>();

  const handleSave = async (input: CounterpartyInput) => {
    if (editing) {
      await updateCounterparty.mutateAsync({ id: editing.id, input });
    } else {
      await createCounterparty.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const saving = createCounterparty.isPending || updateCounterparty.isPending;

  const columns = useMemo<GridColDef<CounterpartyRow>[]>(
    () => [
      {
        field: 'displayName',
        headerName: 'Nome / Razao Social',
        flex: 1.3,
        minWidth: 220,
        renderCell: ({ row }) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={500}>
              {row.displayName}
            </Typography>
            {row.tradeName && (
              <Typography variant="caption" color="text.secondary">
                {row.legalName}
              </Typography>
            )}
            {row.email && (
              <Typography variant="caption" color="text.secondary">
                {row.email}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'counterpartyTypeName',
        headerName: 'Tipo',
        flex: 0.8,
        minWidth: 130,
        renderCell: ({ row }) => {
          const typeColor: 'success' | 'warning' | 'default' =
            row.counterpartyTypeName === 'Cliente'
              ? 'success'
              : row.counterpartyTypeName === 'Fornecedor'
                ? 'warning'
                : 'default';

          return row.counterpartyTypeId ? (
            <Chip
              label={row.counterpartyTypeName}
              size="small"
              color={typeColor}
              sx={{ height: 20 }}
            />
          ) : (
            '-'
          );
        },
      },
      {
        field: 'document',
        headerName: 'Documento',
        flex: 0.9,
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', fontSize: '0.76rem' }}
          >
            {row.documentType ? `${row.documentType} ` : ''}
            {row.document ?? '-'}
          </Typography>
        ),
      },
      {
        field: 'cityState',
        headerName: 'Cidade/UF',
        flex: 0.9,
        minWidth: 140,
        valueGetter: (_, row) =>
          row.city && row.state
            ? `${row.city}/${row.state}`
            : row.city ?? row.state ?? '-',
      },
      {
        field: 'phoneNumber',
        headerName: 'Telefone',
        flex: 0.8,
        minWidth: 130,
        valueFormatter: (value) => value ?? '-',
      },
      {
        field: 'segmentName',
        headerName: 'Segmento',
        flex: 0.9,
        minWidth: 150,
      },
      {
        field: 'active',
        headerName: 'Status',
        flex: 0.7,
        minWidth: 110,
        valueFormatter: (value) => (value ? 'Ativo' : 'Inativo'),
        renderCell: ({ row }) => (
          <Chip
            label={row.active ? 'Ativo' : 'Inativo'}
            size="small"
            color={row.active ? 'success' : 'default'}
            sx={{ height: 20 }}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Acoes',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        disableExport: true,
        renderCell: ({ row }) => (
          <RowActions
            onEdit={() => {
              const original = counterparties.find((item) => item.id === row.id);
              setEditing(original);
              setDialogOpen(true);
            }}
            onDelete={() => {
              void deleteCounterparty.mutateAsync(row.id);
            }}
          />
        ),
      },
    ],
    [counterparties, deleteCounterparty],
  );

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Contraparte"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <AppDataGrid
        rows={counterpartyRows}
        columns={columns}
        emptyMessage="Nenhuma contraparte encontrada."
        exportFileName="contrapartes"
        height={500}
      />

      <CounterpartyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        counterpartyTypes={counterpartyTypes}
        segments={segments}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
