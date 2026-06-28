import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField,
} from '@mui/material';
import type { Field } from '../../data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Field;
  onSave: (data: Partial<Field>) => void;
}

export function FieldDialog({ open, onClose, editing, onSave }: Props) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');

  useEffect(() => {
    setName(editing?.name ?? '');
    setArea(String(editing?.area_hectares ?? ''));
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Campo' : 'Novo Campo Agrícola'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome do Campo" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <TextField label="Área (hectares)" type="number" value={area}
            onChange={e => setArea(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name}
          onClick={() => onSave({
            name,
            area_hectares: area ? Number(area) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
