import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Batch } from '../../data/types';
import { useApp } from '../../context/AppContext';

const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Batch;
  onSave: (data: Partial<Batch>) => void;
}

export function BatchDialog({ open, onClose, editing, onSave }: Props) {
  const { products, cuts, fields } = useApp();
  const [productId, setProductId] = useState('');
  const [code, setCode] = useState('');
  const [quality, setQuality] = useState('');
  const [cutId, setCutId] = useState('');
  const [batchDate, setBatchDate] = useState('');
  const [status, setStatus] = useState('PROCESSANDO');
  const [cost, setCost] = useState('');

  useEffect(() => {
    setProductId(String(editing?.product_id ?? ''));
    setCode(editing?.code ?? '');
    setQuality(editing?.quality_grade ?? '');
    setCutId(String(editing?.cut_id ?? ''));
    setBatchDate(editing?.batch_date ?? '');
    setStatus(editing?.status ?? 'PROCESSANDO');
    setCost(String(editing?.cost ?? ''));
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Lote' : 'Novo Lote'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Código do Lote" value={code} onChange={e => setCode(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Produto</InputLabel>
            <Select value={productId} label="Produto" onChange={e => setProductId(e.target.value)}>
              {products.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Corte Vinculado</InputLabel>
            <Select value={cutId} label="Corte Vinculado" onChange={e => setCutId(e.target.value)}>
              <MenuItem value="">— Nenhum —</MenuItem>
              {cuts.map(c => {
                const field = fields.find(fi => fi.id === c.field_id);
                return (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {field?.name} — Corte #{c.cut_number} ({fmtDate(c.cut_date)})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Qualidade" value={quality} onChange={e => setQuality(e.target.value)}
              fullWidth placeholder="A, A+, B..." />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                <MenuItem value="PROCESSANDO">Processando</MenuItem>
                <MenuItem value="DISPONÍVEL">Disponível</MenuItem>
                <MenuItem value="VENDIDO">Vendido</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Data do Lote" type="date" value={batchDate}
              onChange={e => setBatchDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Custo Total (R$)" type="number" value={cost}
              onChange={e => setCost(e.target.value)} fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained"
          onClick={() => onSave({
            code: code || undefined, product_id: productId ? Number(productId) : undefined,
            cut_id: cutId ? Number(cutId) : undefined, quality_grade: quality || undefined,
            batch_date: batchDate || undefined, status: status || undefined,
            cost: cost ? Number(cost) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
