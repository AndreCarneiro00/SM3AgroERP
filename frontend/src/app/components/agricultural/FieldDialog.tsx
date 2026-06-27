import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Field } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Field;
  onSave: (data: Partial<Field>) => void;
}

export function FieldDialog({ open, onClose, editing, onSave }: Props) {
  const { productFamilies } = useApp();
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [familyId, setFamilyId] = useState('');

  useEffect(() => {
    setName(editing?.name ?? '');
    setArea(String(editing?.area_hectares ?? ''));
    setFamilyId(String(editing?.product_family_id ?? ''));
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Campo' : 'Novo Campo Agrícola'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome do Campo" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField label="Área (hectares)" type="number" value={area}
            onChange={e => setArea(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Família de Produto</InputLabel>
            <Select value={familyId} label="Família de Produto" onChange={e => setFamilyId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {productFamilies.map(pf => (
                <MenuItem key={pf.id} value={String(pf.id)}>{pf.name}</MenuItem>
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
            area_hectares: area ? Number(area) : undefined,
            product_family_id: familyId ? Number(familyId) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
