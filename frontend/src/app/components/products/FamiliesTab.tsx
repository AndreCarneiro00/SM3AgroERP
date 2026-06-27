import { useState } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
} from '@mui/material';
import type { ProductFamily } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

export function FamiliesTab() {
  const { productFamilies, setProductFamilies, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFamily | undefined>();
  const [name, setName] = useState('');

  const openCreate = () => { setEditing(undefined); setName(''); setDialogOpen(true); };
  const openEdit = (pf: ProductFamily) => { setEditing(pf); setName(pf.name); setDialogOpen(true); };

  const handleSave = () => {
    setProductFamilies(fs =>
      editing
        ? fs.map(f => f.id === editing.id ? { ...f, name } : f)
        : [...fs, { id: nextId(productFamilies), name }]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Família" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome da Família</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productFamilies.map(pf => (
              <TableRow key={pf.id}>
                <TableCell><Typography variant="body2" fontWeight={500}>{pf.name}</Typography></TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(pf)}
                    onDelete={() => setProductFamilies(fs => fs.filter(f => f.id !== pf.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar Família' : 'Nova Família'}</DialogTitle>
        <DialogContent>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!name} onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
