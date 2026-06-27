import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Product } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product;
  onSave: (data: Partial<Product>) => void;
}

export function ProductDialog({ open, onClose, editing, onSave }: Props) {
  const { productFamilies, unitsOfMeasure } = useApp();
  const [name, setName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [unitId, setUnitId] = useState('');

  useEffect(() => {
    setName(editing?.name ?? '');
    setFamilyId(String(editing?.product_family_id ?? ''));
    setUnitId(String(editing?.unit_id ?? ''));
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome do Produto" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Família</InputLabel>
            <Select value={familyId} label="Família" onChange={e => setFamilyId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {productFamilies.map(pf => (
                <MenuItem key={pf.id} value={String(pf.id)}>{pf.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Unidade de Medida</InputLabel>
            <Select value={unitId} label="Unidade de Medida" onChange={e => setUnitId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {unitsOfMeasure.map(u => (
                <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name}
          onClick={() => onSave({
            name,
            product_family_id: familyId ? Number(familyId) : undefined,
            unit_id: unitId ? Number(unitId) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
