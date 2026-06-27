import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { BankAccount } from '../../data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: BankAccount;
  onSave: (data: Partial<BankAccount>) => void;
}

export function BankAccountDialog({ open, onClose, editing, onSave }: Props) {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState('Conta Corrente');
  const [accountGroup, setAccountGroup] = useState('');
  const [institution, setInstitution] = useState('');
  const [agency, setAgency] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [balanceDate, setBalanceDate] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(editing?.name ?? '');
    setAccountType(editing?.account_type ?? 'Conta Corrente');
    setAccountGroup(editing?.account_group ?? '');
    setInstitution(editing?.financial_institution ?? '');
    setAgency(editing?.agency ?? '');
    setAccountNumber(editing?.account_number ?? '');
    setBalance(String(editing?.initial_balance ?? ''));
    setBalanceDate(editing?.initial_balance_date ?? new Date().toISOString().split('T')[0]);
    setActive(editing?.active ?? true);
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome da Conta" value={name} onChange={e => setName(e.target.value)} fullWidth />

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Conta</InputLabel>
              <Select value={accountType} label="Tipo de Conta" onChange={e => setAccountType(e.target.value)}>
                <MenuItem value="Conta Corrente">Conta Corrente</MenuItem>
                <MenuItem value="Poupança">Poupança</MenuItem>
                <MenuItem value="Investimento">Investimento</MenuItem>
                <MenuItem value="Caixa">Caixa</MenuItem>
                <MenuItem value="Crédito Rural">Crédito Rural</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Grupo" value={accountGroup}
              onChange={e => setAccountGroup(e.target.value)} fullWidth />
          </Stack>

          <TextField label="Instituição Financeira" value={institution}
            onChange={e => setInstitution(e.target.value)} fullWidth />

          <Stack direction="row" spacing={1.5}>
            <TextField label="Agência" value={agency} onChange={e => setAgency(e.target.value)} fullWidth />
            <TextField label="Número da Conta" value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)} fullWidth />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField label="Saldo Inicial (R$)" type="number" value={balance}
              onChange={e => setBalance(e.target.value)} fullWidth />
            <TextField label="Data Saldo Inicial" type="date" value={balanceDate}
              onChange={e => setBalanceDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={active ? 'ativo' : 'inativo'} label="Status"
              onChange={e => setActive(e.target.value === 'ativo')}>
              <MenuItem value="ativo">Ativa</MenuItem>
              <MenuItem value="inativo">Inativa</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name}
          onClick={() => onSave({
            name, account_type: accountType, account_group: accountGroup || undefined,
            financial_institution: institution || undefined, agency: agency || undefined,
            account_number: accountNumber || undefined,
            initial_balance: balance ? Number(balance) : undefined,
            initial_balance_date: balanceDate || undefined, active,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
