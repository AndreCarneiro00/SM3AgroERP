import { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import type {
  Field,
  FieldInput,
} from '../../../domains/agricultural/model/entities';
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

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Area (ha)</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {field.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {field.areaHectares?.toFixed(1) ?? '-'} ha
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => {
                      setEditing(field);
                      setDialogOpen(true);
                    }}
                    onDelete={() => {
                      void deleteField.mutateAsync(field.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
