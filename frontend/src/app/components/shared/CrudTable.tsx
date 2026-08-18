import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';
import { RowActions } from './RowActions';
import { DataTable, type TableColumn } from './table';

export interface CrudColumn<T> extends TableColumn<T> {
  label: string;
}

interface CrudTableProps<T extends { id: number }> {
  items: T[];
  onCreate: (input: Partial<T>) => Promise<unknown> | unknown;
  onUpdate: (params: {
    id: number;
    input: Partial<T>;
  }) => Promise<unknown> | unknown;
  onDelete: (id: number) => Promise<unknown> | unknown;
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
  tableMinWidth?: number | string;
  tableMaxHeight?: number | string;
  stickyHeader?: boolean;
  actionsSticky?: boolean;
}

export function CrudTable<T extends { id: number }>({
  items,
  onCreate,
  onUpdate,
  onDelete,
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
  tableMinWidth,
  tableMaxHeight,
  stickyHeader,
  actionsSticky,
}: CrudTableProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>();
  const [form, setForm] = useState<Partial<T>>(createInitial());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const handleSave = async () => {
    const payload = normalize ? normalize(form) : form;
    setIsSubmitting(true);

    try {
      if (editing) {
        await onUpdate({ id: editing.id, input: payload });
      } else {
        await onCreate(payload);
      }

      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);

    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <PageHeader actionLabel={actionLabel} onAction={openCreate}>
        {headerContent}
      </PageHeader>

      <DataTable
        items={list}
        columns={columns}
        getRowId={(item) => item.id}
        emptyMessage={emptyMessage}
        minWidth={tableMinWidth ?? Math.max(560, columns.length * 128 + 96)}
        maxHeight={tableMaxHeight}
        stickyHeader={stickyHeader}
        actionsSticky={actionsSticky}
        renderActions={(item) => (
          <RowActions
            onEdit={() => openEdit(item)}
            onDelete={() => {
              void handleDelete(item.id);
            }}
            disabled={isSubmitting || deletingId === item.id}
          />
        )}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{dialogTitle(editing)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {renderForm({ form, setForm, editing })}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={isSaveDisabled(form) || isSubmitting}
            onClick={() => {
              void handleSave();
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
