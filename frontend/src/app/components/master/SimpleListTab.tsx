import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { DataTable, type TableColumn } from '../shared/table';

interface SimpleItem {
  id: number;
  name: string;
}

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  minWidth?: number | string;
  nowrap?: boolean;
}

interface Props<T extends SimpleItem> {
  items: T[];
  entityLabel: string;
  onSave: (editing: T | undefined, form: Partial<T>) => void | Promise<void>;
  onDelete: (item: T) => void | Promise<void>;
  extraColumns?: Column<T>[];
  ExtraFields?: React.FC<{
    form: Partial<T>;
    setForm: React.Dispatch<React.SetStateAction<Partial<T>>>;
  }>;
  createInitial?: () => Partial<T>;
  saving?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function SimpleListTab<T extends SimpleItem>({
  items,
  entityLabel,
  onSave,
  onDelete,
  extraColumns,
  ExtraFields,
  createInitial,
  saving = false,
  isLoading = false,
  emptyMessage = 'Nenhum registro encontrado.',
}: Props<T>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>();
  const [form, setForm] = useState<Partial<T>>({} as Partial<T>);

  const buildInitialForm = () =>
    ({
      name: '',
      ...(createInitial?.() ?? {}),
    } as Partial<T>);

  const openCreate = () => {
    setEditing(undefined);
    setForm(buildInitialForm());
    setDialogOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setForm({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    await onSave(editing, form);
    setDialogOpen(false);
    setEditing(undefined);
  };

  const columns: TableColumn<T>[] = [
    {
      id: 'name',
      label: 'Nome',
      minWidth: 220,
      render: (item) => (
        <Typography variant="body2" fontWeight={500}>
          {item.name}
        </Typography>
      ),
    },
    ...(extraColumns?.map((column) => ({
      id: String(column.key),
      label: column.label,
      align: column.align,
      minWidth: column.minWidth ?? 160,
      nowrap: column.nowrap,
      cellSx: { color: 'text.secondary' },
      render: (item: T) =>
        column.render ? column.render(item) : String(item[column.key] ?? '-'),
    })) ?? []),
  ];

  return (
    <Box>
      <PageHeader actionLabel={`Novo(a) ${entityLabel}`} onAction={openCreate} />

      <DataTable
        items={items}
        columns={columns}
        getRowId={(item) => item.id}
        isLoading={isLoading}
        loadingMessage={`Carregando ${entityLabel.toLowerCase()}...`}
        emptyMessage={emptyMessage}
        minWidth={Math.max(640, columns.length * 180 + 120)}
        renderActions={(item) => (
          <RowActions
            onEdit={() => openEdit(item)}
            onDelete={() => {
              void onDelete(item);
            }}
          />
        )}
      />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editing ? `Editar ${entityLabel}` : `Novo(a) ${entityLabel}`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nome"
              value={(form.name as string) ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              fullWidth
            />
            {ExtraFields && <ExtraFields form={form} setForm={setForm} />}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!String(form.name ?? '').trim() || saving}
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
