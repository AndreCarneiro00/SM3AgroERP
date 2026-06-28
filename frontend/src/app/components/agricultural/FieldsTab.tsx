import { useState } from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { Field } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { StatBox } from '../shared/StatBox';
import { RowActions } from '../shared/RowActions';
import { FieldDialog } from './FieldDialog';

export function FieldsTab() {
  const { fields, setFields, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Field | undefined>();

  const totalArea = fields.reduce((s, f) => s + (f.area_hectares ?? 0), 0);

  const handleSave = (d: Partial<Field>) => {
    setFields(fs =>
      editing
        ? fs.map(f => f.id === editing.id ? { ...editing, ...d } : f)
        : [...fs, { id: nextId(fields), ...d } as Field]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Campo" onAction={() => { setEditing(undefined); setDialogOpen(true); }}>
        <StatBox label="Total de Campos" value={String(fields.length)} />
        <StatBox label="Área Total" value={`${totalArea.toFixed(1)} ha`} />
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Área (ha)</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map(f => (
              <TableRow key={f.id}>
                <TableCell><Typography variant="body2" fontWeight={500}>{f.name}</Typography></TableCell>
                <TableCell>{f.area_hectares?.toFixed(1) ?? '-'} ha</TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => { setEditing(f); setDialogOpen(true); }}
                    onDelete={() => setFields(fs => fs.filter(x => x.id !== f.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <FieldDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSave={handleSave} />
    </Box>
  );
}
