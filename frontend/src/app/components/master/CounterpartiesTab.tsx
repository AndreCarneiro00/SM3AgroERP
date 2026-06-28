import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import type { Counterparty } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { getCounterpartyName } from '../../data/display';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { CounterpartyDialog } from './CounterpartyDialog';

export function CounterpartiesTab() {
  const { counterparties, setCounterparties, counterpartyTypes, segments, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Counterparty | undefined>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    let list = counterparties;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        getCounterpartyName(c).toLowerCase().includes(q) ||
        c.legal_name.toLowerCase().includes(q) ||
        c.document?.includes(search) ||
        c.email?.toLowerCase().includes(q)
      );
    }
    if (typeFilter) list = list.filter(c => String(c.counterparty_type_id) === typeFilter);
    return list;
  }, [counterparties, search, typeFilter]);

  const handleSave = (d: Partial<Counterparty>) => {
    setCounterparties(cs =>
      editing
        ? cs.map(c => c.id === editing.id ? { ...editing, ...d } : c)
        : [...cs, { id: nextId(cs), active: true, ...d } as Counterparty]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Contraparte" onAction={() => { setEditing(undefined); setDialogOpen(true); }}>
        <TextField
          size="small" placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={search} onChange={e => setSearch(e.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={typeFilter} label="Tipo" onChange={e => setTypeFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {counterpartyTypes.map(ct => (
              <MenuItem key={ct.id} value={String(ct.id)}>{ct.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome / Razão Social</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Cidade/UF</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Segmento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(c => {
              const cpType = counterpartyTypes.find(ct => ct.id === c.counterparty_type_id);
              const seg = segments.find(s => s.id === c.segment_id);
              const typeColor: 'success' | 'warning' | 'default' =
                cpType?.name === 'Cliente' ? 'success' :
                cpType?.name === 'Fornecedor' ? 'warning' : 'default';

              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{getCounterpartyName(c)}</Typography>
                    {c.trade_name && (
                      <Typography variant="caption" color="text.secondary">{c.legal_name}</Typography>
                    )}
                    {c.email && (
                      <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {cpType && (
                      <Chip label={cpType.name} size="small" color={typeColor} sx={{ height: 20 }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.76rem' }}>
                    {c.document_type && (
                      <Box component="span" sx={{ mr: 0.5, fontSize: '0.68rem', color: '#888' }}>
                        {c.document_type}
                      </Box>
                    )}
                    {c.document ?? '-'}
                  </TableCell>
                  <TableCell>
                    {c.city && c.state ? `${c.city}/${c.state}` : c.city ?? c.state ?? '-'}
                  </TableCell>
                  <TableCell>{c.phone_number ?? '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{seg?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Chip label={c.active ? 'Ativo' : 'Inativo'} size="small"
                      color={c.active ? 'success' : 'default'} sx={{ height: 20 }} />
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => { setEditing(c); setDialogOpen(true); }}
                      onDelete={() => setCounterparties(cs => cs.filter(x => x.id !== c.id))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <EmptyTableRow colSpan={8} message="Nenhuma contraparte encontrada." />}
          </TableBody>
        </Table>
      </Card>

      <CounterpartyDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        editing={editing} onSave={handleSave} />
    </Box>
  );
}
