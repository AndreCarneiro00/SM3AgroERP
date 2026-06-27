import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography,
} from '@mui/material';
import type { ChartOfAccount } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: ChartOfAccount;
  parentId?: number;
  onSave: (data: Partial<ChartOfAccount>) => void;
}

export function ChartDialog({ open, onClose, editing, parentId, onSave }: Props) {
  const { chartOfAccounts } = useApp();
  const parentName = chartOfAccounts.find(c => c.id === parentId)?.name;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<ChartOfAccount['type']>('EXPENSE');
  const [accepts, setAccepts] = useState(true);
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(editing?.name ?? '');
    setCode(editing?.code ?? '');
    setType(editing?.type ?? 'EXPENSE');
    setAccepts(editing?.accepts_transaction ?? true);
    setActive(editing?.active ?? true);
  }, [editing, open]);

  const handleSave = () => {
    onSave({
      name, code: code || undefined, type, accepts_transaction: accepts, active,
      parent_id: editing ? editing.parent_id : parentId,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Conta' : parentId ? 'Nova Subconta' : 'Nova Conta Raiz'}
      </DialogTitle>
      <DialogContent>
        {parentId && !editing && (
          <Box sx={{ mb: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
            <Typography variant="caption">Pai: {parentName}</Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField label="Código" value={code} onChange={e => setCode(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select value={type} label="Tipo" onChange={e => setType(e.target.value as ChartOfAccount['type'])}>
              <MenuItem value="INCOME">Receita</MenuItem>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
              <MenuItem value="TRANSFER">Transferência</MenuItem>
              <MenuItem value="MANAGERIAL">Gerencial</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Aceita Lançamentos</InputLabel>
            <Select value={accepts ? 'sim' : 'nao'} label="Aceita Lançamentos"
              onChange={e => setAccepts(e.target.value === 'sim')}>
              <MenuItem value="sim">Sim</MenuItem>
              <MenuItem value="nao">Não (analítico)</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={active ? 'ativo' : 'inativo'} label="Status"
              onChange={e => setActive(e.target.value === 'ativo')}>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name} onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
