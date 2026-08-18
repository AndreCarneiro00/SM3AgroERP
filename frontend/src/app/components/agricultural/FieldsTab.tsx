import { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import type {
  Field,
  FieldInput,
} from '../../../domains/agricultural/model/entities';
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { StatBox } from '../shared/StatBox';
import { FieldDialog } from './FieldDialog';

export function FieldsTab() {
  const { fields } = useAgriculturalCatalogData();
  const { createField, updateField, deleteField } = useAgriculturalMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Field | undefined>();

  const totalArea = fields.reduce(
    (sum, field) => sum + (field.areaHectares ?? 0),
    0,
  );

  const handleSave = async (input: FieldInput) => {
    if (editing) {
      await updateField.mutateAsync({ id: editing.id, input });
    } else {
      await createField.mutateAsync(input);
    }

    setDialogOpen(false);
  };

  const columns: GridColDef<Field>[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 180,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'areaHectares',
      headerName: 'Area (ha)',
      type: 'number',
      flex: 0.7,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) =>
        value === undefined || value === null ? '-' : `${Number(value).toFixed(1)} ha`,
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
            setEditing(row);
            setDialogOpen(true);
          }}
          onDelete={() => {
            void deleteField.mutateAsync(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Campo"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <StatBox label="Total de Campos" value={String(fields.length)} />
        <StatBox label="Area Total" value={`${totalArea.toFixed(1)} ha`} />
      </PageHeader>

      <AppDataGrid
        rows={fields}
        columns={columns}
        emptyMessage="Nenhum campo cadastrado."
        exportFileName="campos"
      />

      <FieldDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        saving={createField.isPending || updateField.isPending}
        onSave={(input) => {
          void handleSave(input);
        }}
      />
    </Box>
  );
}
