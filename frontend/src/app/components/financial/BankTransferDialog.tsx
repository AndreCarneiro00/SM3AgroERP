import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { BankTransfer } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: BankTransfer;
  onSave: (data: Partial<BankTransfer>) => void;
}

export function BankTransferDialog({ open, onClose, editing, onSave }: Props) {
  const { bankAccounts } = useApp();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (open) {
      setSource(String(editing?.source_bank_account_id ?? ''));
      setDestination(String(editing?.destination_bank_account_id ?? ''));
      setAmount(String(editing?.amount ?? ''));
      setDate(editing?.transfer_date ?? new Date().toISOString().split('T')[0]);
      setObs(editing?.observation ?? '');
    }
  }, [open, editing]);

  const handleSave = () => {
    onSave({
      source_bank_account_id: Number(source),
      destination_bank_account_id: Number(destination),
      amount: Number(amount),
      transfer_date: date,
      observation: obs || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Transferência' : 'Nova Transferência Bancária'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Conta Origem</InputLabel>
            <Select value={source} label="Conta Origem" onChange={e => setSource(e.target.value)}>
              {bankAccounts.filter(b => b.active).map(b => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Conta Destino</InputLabel>
            <Select value={destination} label="Conta Destino"
              onChange={e => setDestination(e.target.value)}>
              {bankAccounts.filter(b => b.active && String(b.id) !== source).map(b => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Valor (R$)" type="number" value={amount}
            onChange={e => setAmount(e.target.value)} fullWidth />
          <TextField label="Data" type="date" value={date}
            onChange={e => setDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Observação" value={obs}
            onChange={e => setObs(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained"
          disabled={!source || !destination || !amount || !date}
          onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
