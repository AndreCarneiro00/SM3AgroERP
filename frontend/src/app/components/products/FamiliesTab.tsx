import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { ProductFamily } from '../../../domains/products/model/entities';
import {
  useProductsCatalogData,
  useProductsCatalogMutations,
} from '../../../domains/products/ui/hooks';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

export function FamiliesTab() {
  const { productFamilies, isLoading } = useProductsCatalogData();
  const { createProductFamily, deleteProductFamily, updateProductFamily } =
    useProductsCatalogMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFamily | undefined>();
  const [name, setName] = useState('');

  const openCreate = () => {
    setEditing(undefined);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = (productFamily: ProductFamily) => {
    setEditing(productFamily);
    setName(productFamily.name);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editing) {
      await updateProductFamily.mutateAsync({
        id: editing.id,
        input: { name: trimmedName },
      });
    } else {
      await createProductFamily.mutateAsync({ name: trimmedName });
    }

    setDialogOpen(false);
    setEditing(undefined);
    setName('');
  };

  const saving = createProductFamily.isPending || updateProductFamily.isPending;

  return (
    <Box>
      <PageHeader actionLabel="Nova Familia" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome da Familia</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando familias...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {productFamilies.map((productFamily) => (
              <TableRow key={productFamily.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {productFamily.name}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(productFamily)}
                    onDelete={() => {
                      void deleteProductFamily.mutateAsync(productFamily.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editing ? 'Editar Familia' : 'Nova Familia'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!name.trim() || saving}
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
