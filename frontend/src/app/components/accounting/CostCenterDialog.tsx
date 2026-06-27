import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography,
} from '@mui/material';
import type { CostCenter } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: CostCenter;
  parentId?: number;
  onSave: (data: Partial<CostCenter>) => void;
}

export function CostCenterDialog({ open, onClose, editing, parentId, onSave }: Props) {
  const { costCenters, activityGroups } = useApp();
  const parentName = costCenters.find(c => c.id === parentId)?.name;

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<'CAPEX' | 'OPEX'>('OPEX');
  const [description, setDescription] = useState('');
  const [accepts, setAccepts] = useState(true);
  const [activityGroupId, setActivityGroupId] = useState('');

  useEffect(() => {
    setName(editing?.name ?? '');
    setCode(editing?.code ?? '');
    setType(editing?.type ?? 'OPEX');
    setDescription(editing?.description ?? '');
    setAccepts(editing?.accepts_transaction ?? true);
    setActivityGroupId(String(editing?.activity_group_id ?? ''));
  }, [editing, open]);

  const handleSave = () => {
    onSave({
      name, code: code || undefined, type, description: description || undefined,
      accepts_transaction: accepts, active: true,
      activity_group_id: activityGroupId ? Number(activityGroupId) : undefined,
      parent_id: editing ? editing.parent_id : parentId,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Centro de Custo' : parentId ? 'Novo Sub-centro' : 'Novo Centro de Custo'}
      </DialogTitle>
      <DialogContent>
        {parentId && !editing && (
          <Box sx={{ mb: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
            <Typography variant="caption">Pai: {parentName}</Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <Stack direction="row" spacing={1.5}>
            <TextField label="Código" value={code} onChange={e => setCode(e.target.value)} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select value={type} label="Tipo" onChange={e => setType(e.target.value as 'CAPEX' | 'OPEX')}>
                <MenuItem value="CAPEX">CAPEX</MenuItem>
                <MenuItem value="OPEX">OPEX</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField label="Descrição" value={description}
            onChange={e => setDescription(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Grupo de Atividade</InputLabel>
            <Select value={activityGroupId} label="Grupo de Atividade"
              onChange={e => setActivityGroupId(e.target.value)}>
              <MenuItem value="">— Nenhum —</MenuItem>
              {activityGroups.map(ag => (
                <MenuItem key={ag.id} value={String(ag.id)}>{ag.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Aceita Lançamentos</InputLabel>
            <Select value={accepts ? 'sim' : 'nao'} label="Aceita Lançamentos"
              onChange={e => setAccepts(e.target.value === 'sim')}>
              <MenuItem value="sim">Sim</MenuItem>
              <MenuItem value="nao">Não</MenuItem>
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
