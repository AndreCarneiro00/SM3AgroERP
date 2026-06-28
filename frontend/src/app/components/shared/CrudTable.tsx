import { useState } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
} from '@mui/material';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { RowActions } from './RowActions';
import { EmptyTableRow } from './EmptyTableRow';

export interface CrudColumn<T> {
  label: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface CrudTableProps<T extends { id: number }> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  nextId: (items: T[]) => number;
  actionLabel: string;
  dialogTitle: (editing?: T) => string;
  createInitial: () => Partial<T>;
  columns: CrudColumn<T>[];
  renderForm: (props: {
    form: Partial<T>;
    setForm: React.Dispatch<React.SetStateAction<Partial<T>>>;
    editing?: T;
  }) => ReactNode;
  isSaveDisabled: (form: Partial<T>) => boolean;
  normalize?: (form: Partial<T>) => Partial<T>;
  emptyMessage?: string;
  headerContent?: ReactNode;
  sortItems?: (items: T[]) => T[];
}

export function CrudTable<T extends { id: number }>({
  items,
  setItems,
  nextId,
  actionLabel,
  dialogTitle,
  createInitial,
  columns,
  renderForm,
  isSaveDisabled,
  normalize,
  emptyMessage,
  headerContent,
  sortItems,
}: CrudTableProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>();
  const [form, setForm] = useState<Partial<T>>(createInitial());

  const list = sortItems ? sortItems(items) : items;

  const openCreate = () => {
    setEditing(undefined);
    setForm(createInitial());
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload = normalize ? normalize(form) : form;
    setItems((current) =>
      editing
        ? current.map((item) =>
            item.id === editing.id ? ({ ...item, ...payload } as T) : item
          )
        : [...current, { id: nextId(current), ...payload } as T]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel={actionLabel} onAction={openCreate}>
        {headerContent}
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.label} align={column.align}>
                  {column.label}
                </TableCell>
              ))}
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.label} align={column.align}>
                    {column.render(item)}
                  </TableCell>
                ))}
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(item)}
                    onDelete={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <EmptyTableRow colSpan={columns.length + 1} message={emptyMessage} />
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle(editing)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {renderForm({ form, setForm, editing })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={isSaveDisabled(form)} onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
