import { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Chip, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { InventoryMovement } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { StatBox } from '../shared/StatBox';
import { EmptyTableRow } from '../shared/EmptyTableRow';

const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const MOVE_COLOR: Record<string, 'success' | 'error' | 'warning'> = {
  ENTRADA: 'success', 'SAÍDA': 'error', AJUSTE: 'warning',
};

function MovementDialog({ open, onClose, onSave }: {
  open: boolean; onClose: () => void;
  onSave: (data: Partial<InventoryMovement>) => void;
}) {
  const { batches, products } = useApp();
  const [batchId, setBatchId] = useState('');
  const [type, setType] = useState('ENTRADA');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setBatchId(''); setType('ENTRADA'); setQuantity(''); setUnitCost('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Lote</InputLabel>
            <Select value={batchId} label="Lote" onChange={e => setBatchId(e.target.value)}>
              {batches.map(b => {
                const product = products.find(p => p.id === b.product_id);
                return (
                  <MenuItem key={b.id} value={String(b.id)}>
                    {b.code} — {product?.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select value={type} label="Tipo" onChange={e => setType(e.target.value)}>
              <MenuItem value="ENTRADA">Entrada</MenuItem>
              <MenuItem value="SAÍDA">Saída</MenuItem>
              <MenuItem value="AJUSTE">Ajuste</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField label="Quantidade" type="number" value={quantity}
              onChange={e => setQuantity(e.target.value)} fullWidth />
            <TextField label="Custo Unitário (R$)" type="number" value={unitCost}
              onChange={e => setUnitCost(e.target.value)} fullWidth />
          </Stack>
          <TextField label="Data" type="date" value={date}
            onChange={e => setDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!batchId || !quantity}
          onClick={() => onSave({
            batch_id: Number(batchId), movement_type: type,
            quantity: Number(quantity),
            unit_cost: unitCost ? Number(unitCost) : undefined,
            movement_date: date,
          })}>
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function InventoryModule() {
  const { inventoryMovements, setInventoryMovements, batches, products, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const sorted = [...inventoryMovements].sort((a, b) =>
    (b.movement_date ?? '').localeCompare(a.movement_date ?? '')
  );

  const totalIn  = sorted.filter(m => m.movement_type === 'ENTRADA').reduce((s, m) => s + (m.quantity ?? 0), 0);
  const totalOut = sorted.filter(m => m.movement_type === 'SAÍDA').reduce((s, m) => s + (m.quantity ?? 0), 0);

  const handleSave = (data: Partial<InventoryMovement>) => {
    setInventoryMovements(ms => [...ms, { id: nextId(inventoryMovements), ...data } as InventoryMovement]);
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Movimentação" onAction={() => setDialogOpen(true)}>
        <StatBox label="Total Entradas" value={`${totalIn.toLocaleString('pt-BR')} un`} />
        <StatBox label="Total Saídas" value={`${totalOut.toLocaleString('pt-BR')} un`} color="#D32F2F" bgColor="#FFEBEE" />
        <StatBox label="Saldo" value={`${(totalIn - totalOut).toLocaleString('pt-BR')} un`} color="#1565C0" bgColor="#E3F2FD" />
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Lote</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Quantidade</TableCell>
              <TableCell align="right">Custo Unit.</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(m => {
              const batch = batches.find(b => b.id === m.batch_id);
              const product = batch ? products.find(p => p.id === batch.product_id) : undefined;
              const total = (m.quantity ?? 0) * (m.unit_cost ?? 0);
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {batch?.code ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{product?.name ?? '-'}</TableCell>
                  <TableCell>
                    <Chip label={m.movement_type ?? '-'} size="small"
                      color={MOVE_COLOR[m.movement_type ?? ''] ?? 'default'} sx={{ height: 20 }} />
                  </TableCell>
                  <TableCell>{fmtDate(m.movement_date)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {m.movement_type === 'SAÍDA' ? '-' : '+'}{m.quantity?.toLocaleString('pt-BR') ?? 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{fmtBRL(m.unit_cost ?? 0)}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}
                      sx={{ color: m.movement_type === 'SAÍDA' ? 'error.main' : 'success.main' }}>
                      {fmtBRL(total)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Excluir">
                      <IconButton size="small" color="error"
                        onClick={() => confirm('Confirmar exclusão?') &&
                          setInventoryMovements(ms => ms.filter(x => x.id !== m.id))}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={8} message="Nenhuma movimentação registrada." />}
          </TableBody>
        </Table>
      </Card>

      <MovementDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} />
    </Box>
  );
}
