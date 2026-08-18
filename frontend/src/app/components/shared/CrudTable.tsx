import { isValidElement, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type { ReactNode } from 'react';
import { AppDataGrid } from './AppDataGrid';
import { PageHeader } from './PageHeader';
import { RowActions } from './RowActions';

export interface CrudColumn<T> {
  label: string;
  render: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  exportValue?: (item: T) => string | number | boolean | null | undefined;
  type?: GridColDef['type'];
  minWidth?: number;
  flex?: number;
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
  exportFileName?: string;
}

function stringifyReactNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(stringifyReactNode).filter(Boolean).join(' ');
  }

  if (isValidElement<{ children?: ReactNode; label?: ReactNode }>(node)) {
    return [node.props.label, node.props.children]
      .map(stringifyReactNode)
      .filter(Boolean)
      .join(' ');
  }

  return '';
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
  exportFileName,
}: CrudTableProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>();
  const [form, setForm] = useState<Partial<T>>(createInitial());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const list = sortItems ? sortItems(items) : items;
  const gridColumns = useMemo<GridColDef<T>[]>(
    () => [
      ...columns.map((column, index) => ({
        field: `column${index}`,
        headerName: column.label,
        flex: column.flex ?? 1,
        minWidth: column.minWidth ?? 140,
        align: column.align,
        headerAlign: column.align,
        type: column.type,
        valueGetter: (_value: unknown, row: T) =>
          column.exportValue
            ? column.exportValue(row)
            : stringifyReactNode(column.render(row)),
        renderCell: ({ row }: { row: T }) => column.render(row),
      })),
      {
        field: 'actions',
        headerName: 'Acoes',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        disableExport: true,
        renderCell: ({ row }: { row: T }) => (
          <RowActions
            onEdit={() => openEdit(row)}
            onDelete={() => {
              void handleDelete(row.id);
            }}
            disabled={isSubmitting || deletingId === row.id}
          />
        ),
      },
    ],
    [columns, deletingId, isSubmitting],
  );

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

      <AppDataGrid
        rows={list}
        columns={gridColumns}
        emptyMessage={emptyMessage}
        exportFileName={exportFileName ?? actionLabel.toLowerCase().replace(/\s+/g, '-')}
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
