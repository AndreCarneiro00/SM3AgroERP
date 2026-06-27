import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Cut } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Cut;
  onSave: (data: Partial<Cut>) => void;
}

export function CutDialog({ open, onClose, editing, onSave }: Props) {
  const { fields } = useApp();
  const [fieldId, setFieldId] = useState('');
  const [cutDate, setCutDate] = useState('');
  const [cutNumber, setCutNumber] = useState('');
  const [days, setDays] = useState('');
  const [observation, setObservation] = useState('');

  useEffect(() => {
    setFieldId(String(editing?.field_id ?? ''));
    setCutDate(editing?.cut_date ?? '');
    setCutNumber(String(editing?.cut_number ?? ''));
    setDays(String(editing?.days_since_last_cut ?? ''));
    setObservation(editing?.observation ?? '');
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Corte' : 'Novo Corte'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Campo</InputLabel>
            <Select value={fieldId} label="Campo" onChange={e => setFieldId(e.target.value)}>
              {fields.map(f => <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>)}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Nº do Corte" type="number" value={cutNumber}
              onChange={e => setCutNumber(e.target.value)} fullWidth />
            <TextField label="Data do Corte" type="date" value={cutDate}
              onChange={e => setCutDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>
          <TextField label="Dias desde último corte" type="number" value={days}
            onChange={e => setDays(e.target.value)} fullWidth />
          <TextField label="Observação" value={observation}
            onChange={e => setObservation(e.target.value)} fullWidth multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!fieldId}
          onClick={() => onSave({
            field_id: Number(fieldId),
            cut_date: cutDate || undefined,
            cut_number: cutNumber ? Number(cutNumber) : undefined,
            observation: observation || undefined,
            days_since_last_cut: days ? Number(days) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
