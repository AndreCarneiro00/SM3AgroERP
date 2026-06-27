import { useState } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
} from '@mui/material';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

// Generic CRUD tab for simple name-only lists (segments, activity groups, document types, etc.)

interface SimpleItem { id: number; name: string; [key: string]: unknown }

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface Props<T extends SimpleItem> {
  items: T[];
  setItems: (fn: (prev: T[]) => T[]) => void;
  nextId: (items: T[]) => number;
  entityLabel: string;
  extraColumns?: Column<T>[];
  /** Render extra form fields below the name field; receives current form state and a setter */
  ExtraFields?: React.FC<{
    form: Partial<T>;
    setForm: React.Dispatch<React.SetStateAction<Partial<T>>>;
  }>;
}

export function SimpleListTab<T extends SimpleItem>({
  items, setItems, nextId, entityLabel, extraColumns, ExtraFields,
}: Props<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>();
  const [form, setForm] = useState<Partial<T>>({} as Partial<T>);

  const openCreate = () => {
    setEditing(undefined);
    setForm({ name: '' } as Partial<T>);
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = () => {
    setItems(is =>
      editing
        ? is.map(i => i.id === editing.id ? { ...editing, ...form } as T : i)
        : [...is, { id: nextId(is), ...form } as T]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel={`Novo(a) ${entityLabel}`} onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              {extraColumns?.map(col => (
                <TableCell key={String(col.key)}>{col.label}</TableCell>
              ))}
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                </TableCell>
                {extraColumns?.map(col => (
                  <TableCell key={String(col.key)} sx={{ color: 'text.secondary' }}>
                    {col.render ? col.render(item) : String(item[col.key] ?? '-')}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(item)}
                    onDelete={() => setItems(is => is.filter(i => i.id !== item.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? `Editar ${entityLabel}` : `Novo(a) ${entityLabel}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={(form.name as string) ?? ''}
              onChange={e => setForm(f => ({ ...f, name: e.target.value } as Partial<T>))}
              fullWidth
            />
            {ExtraFields && <ExtraFields form={form} setForm={setForm} />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!form.name} onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
