import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { FinancialTransaction } from '../../data/types';
import { useApp } from '../../context/AppContext';

export interface TransactionFormData {
  description: string;
  counterparty_id: string;
  issue_date: string;
  due_date: string;
  document_number: string;
  status: string;
  type: string;
  observation: string;
  document_type_id: string;
  has_NF: boolean;
  total_amount: string;
}

const empty: TransactionFormData = {
  description: '', counterparty_id: '', issue_date: '', due_date: '',
  document_number: '', status: 'PENDING', type: 'EXPENSE',
  observation: '', document_type_id: '', has_NF: false, total_amount: '',
};

function fromTransaction(t: FinancialTransaction): TransactionFormData {
  return {
    description: t.description ?? '',
    counterparty_id: String(t.counterparty_id ?? ''),
    issue_date: t.issue_date ?? '',
    due_date: t.due_date ?? '',
    document_number: t.document_number ?? '',
    status: t.status,
    type: t.type,
    observation: t.observation ?? '',
    document_type_id: String(t.document_type_id ?? ''),
    has_NF: t.has_NF ?? false,
    total_amount: String(t.total_amount ?? ''),
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: FinancialTransaction;
  onSave: (data: TransactionFormData) => void;
}

export function TransactionDialog({ open, onClose, editing, onSave }: Props) {
  const { counterparties, documentTypes } = useApp();
  const [form, setForm] = useState<TransactionFormData>(editing ? fromTransaction(editing) : empty);
  const set = <K extends keyof TransactionFormData>(k: K, v: TransactionFormData[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    setForm(editing ? fromTransaction(editing) : empty);
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Descrição" value={form.description}
            onChange={e => set('description', e.target.value)} fullWidth />

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select value={form.type} label="Tipo" onChange={e => set('type', e.target.value)}>
                <MenuItem value="INCOME">Receita</MenuItem>
                <MenuItem value="EXPENSE">Despesa</MenuItem>
                <MenuItem value="TRANSFER">Transferência</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={e => set('status', e.target.value)}>
                <MenuItem value="PENDING">Pendente</MenuItem>
                <MenuItem value="PAID">Pago</MenuItem>
                <MenuItem value="PARTIAL">Parcial</MenuItem>
                <MenuItem value="CANCELED">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Contraparte</InputLabel>
            <Select value={form.counterparty_id} label="Contraparte"
              onChange={e => set('counterparty_id', e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {counterparties.map(c => (
                <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.5}>
            <TextField label="Emissão" type="date" value={form.issue_date}
              onChange={e => set('issue_date', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Vencimento" type="date" value={form.due_date}
              onChange={e => set('due_date', e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField label="Nº Documento" value={form.document_number}
              onChange={e => set('document_number', e.target.value)} fullWidth />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Doc.</InputLabel>
              <Select value={form.document_type_id} label="Tipo Doc."
                onChange={e => set('document_type_id', e.target.value)}>
                <MenuItem value="">— Nenhum —</MenuItem>
                {documentTypes.map(d => (
                  <MenuItem key={d.id} value={String(d.id)}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField label="Valor Total (R$)" type="number" value={form.total_amount}
            onChange={e => set('total_amount', e.target.value)} fullWidth />
          <TextField label="Observação" value={form.observation}
            onChange={e => set('observation', e.target.value)} fullWidth multiline rows={2} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!form.description} onClick={() => onSave(form)}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
