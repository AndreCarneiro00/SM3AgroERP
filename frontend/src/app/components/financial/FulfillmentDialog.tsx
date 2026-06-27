import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Box, Typography,
} from '@mui/material';
import type { FinancialTransaction } from '../../data/types';
import { useApp } from '../../context/AppContext';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction;
  onSave: (bankId: number, date: string, amount: number, obs: string) => void;
}

export function FulfillmentDialog({ open, onClose, transaction, onSave }: Props) {
  const { bankAccounts } = useApp();
  const [bankId, setBankId] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (open && transaction) {
      setAmount(String(transaction.total_amount ?? ''));
      setBankId('');
      setDate(new Date().toISOString().split('T')[0]);
      setObs('');
    }
  }, [open, transaction]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar Pagamento</DialogTitle>
      <DialogContent>
        {transaction && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>{transaction.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {fmtBRL(transaction.total_amount ?? 0)}
            </Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Conta Bancária</InputLabel>
            <Select value={bankId} label="Conta Bancária" onChange={e => setBankId(e.target.value)}>
              {bankAccounts.filter(b => b.active).map(b => (
                <MenuItem key={b.id} value={String(b.id)}>{b.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Data do Pagamento" type="date" value={date}
            onChange={e => setDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Valor Pago (R$)" type="number" value={amount}
            onChange={e => setAmount(e.target.value)} fullWidth />
          <TextField label="Observação" value={obs}
            onChange={e => setObs(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color="success"
          disabled={!bankId || !date || !amount}
          onClick={() => onSave(Number(bankId), date, Number(amount), obs)}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
