import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Counterparty } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Counterparty;
  onSave: (data: Partial<Counterparty>) => void;
}

export function CounterpartyDialog({ open, onClose, editing, onSave }: Props) {
  const { counterpartyTypes, segments } = useApp();

  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [docType, setDocType] = useState('');
  const [document, setDocument] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    setLegalName(editing?.legal_name ?? '');
    setTradeName(editing?.trade_name ?? '');
    setTypeId(String(editing?.counterparty_type_id ?? ''));
    setSegmentId(String(editing?.segment_id ?? ''));
    setDocType(editing?.document_type ?? '');
    setDocument(editing?.document ?? '');
    setCity(editing?.city ?? '');
    setState(editing?.state ?? '');
    setPhone(editing?.phone_number ?? '');
    setEmail(editing?.email ?? '');
    setActive(editing?.active ?? true);
  }, [editing, open]);

  const handleSave = () => {
    onSave({
      legal_name: legalName,
      trade_name: tradeName || undefined,
      counterparty_type_id: typeId ? Number(typeId) : undefined,
      segment_id: segmentId ? Number(segmentId) : undefined,
      document_type: docType as Counterparty['document_type'] || undefined,
      document: document || undefined,
      city: city || undefined,
      state: state || undefined,
      phone_number: phone || undefined,
      email: email || undefined,
      active,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Contraparte' : 'Nova Contraparte'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Razão Social / Nome Legal" value={legalName} onChange={e => setLegalName(e.target.value)} fullWidth />
          <TextField label="Nome Fantasia" value={tradeName} onChange={e => setTradeName(e.target.value)} fullWidth />

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select value={typeId} label="Tipo" onChange={e => setTypeId(e.target.value)}>
                <MenuItem value="">— Nenhum —</MenuItem>
                {counterpartyTypes.map(ct => (
                  <MenuItem key={ct.id} value={String(ct.id)}>{ct.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Segmento</InputLabel>
              <Select value={segmentId} label="Segmento" onChange={e => setSegmentId(e.target.value)}>
                <MenuItem value="">— Nenhum —</MenuItem>
                {segments.map(s => (
                  <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Documento</InputLabel>
              <Select value={docType} label="Tipo Documento" onChange={e => setDocType(e.target.value)}>
                <MenuItem value="">— Nenhum —</MenuItem>
                <MenuItem value="CNPJ">CNPJ</MenuItem>
                <MenuItem value="CPF">CPF</MenuItem>
              </Select>
            </FormControl>
            <TextField label="CPF / CNPJ" value={document} onChange={e => setDocument(e.target.value)} fullWidth />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField label="Cidade" value={city} onChange={e => setCity(e.target.value)} fullWidth />
            <TextField label="UF" value={state} onChange={e => setState(e.target.value)} sx={{ width: 100 }} />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField label="Telefone" value={phone} onChange={e => setPhone(e.target.value)} fullWidth />
            <TextField label="E-mail" value={email} onChange={e => setEmail(e.target.value)} fullWidth />
          </Stack>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select value={active ? 'ativo' : 'inativo'} label="Status"
              onChange={e => setActive(e.target.value === 'ativo')}>
              <MenuItem value="ativo">Ativo</MenuItem>
              <MenuItem value="inativo">Inativo</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!legalName} onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}
