import { useState } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField,
} from '@mui/material';
import type { IncomeStatementGroup } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

export function DREGroupsTab() {
  const { incomeStatementGroups, setIncomeStatementGroups, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IncomeStatementGroup | undefined>();
  const [name, setName] = useState('');
  const [order, setOrder] = useState('');

  const sorted = [...incomeStatementGroups].sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99));

  const openCreate = () => {
    setEditing(undefined);
    setName('');
    setOrder('');
    setDialogOpen(true);
  };

  const openEdit = (g: IncomeStatementGroup) => {
    setEditing(g);
    setName(g.name);
    setOrder(String(g.display_order ?? ''));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const item: IncomeStatementGroup = {
      id: editing?.id ?? nextId(incomeStatementGroups),
      name,
      display_order: order ? Number(order) : undefined,
    };
    setIncomeStatementGroups(gs =>
      editing ? gs.map(g => g.id === editing.id ? item : g) : [...gs, item]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Grupo" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell width={80}>Ordem</TableCell>
              <TableCell>Nome do Grupo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(g => (
              <TableRow key={g.id}>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">#{g.display_order ?? '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{g.name}</Typography>
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(g)}
                    onDelete={() => setIncomeStatementGroups(gs => gs.filter(x => x.id !== g.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Editar Grupo DRE' : 'Novo Grupo DRE'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth />
            <TextField label="Ordem de Exibição" type="number" value={order}
              onChange={e => setOrder(e.target.value)} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!name} onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
