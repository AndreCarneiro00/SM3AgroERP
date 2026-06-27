import { useState } from 'react';
import {
  Box, Card, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import type { Batch } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { BatchDialog } from './BatchDialog';

const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';
const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const BATCH_STATUS_COLOR: Record<string, 'success' | 'default' | 'info'> = {
  'DISPONÍVEL': 'success', 'VENDIDO': 'default', 'PROCESSANDO': 'info',
};
const QUALITY_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  'A+': 'success', 'A': 'success', 'B+': 'warning', 'B': 'warning', 'C': 'error',
};

export function BatchesTab() {
  const { batches, setBatches, products, cuts, fields, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Batch | undefined>();
  const sorted = [...batches].sort((a, b) => (b.batch_date ?? '').localeCompare(a.batch_date ?? ''));

  const handleSave = (d: Partial<Batch>) => {
    setBatches(bs =>
      editing
        ? bs.map(b => b.id === editing.id ? { ...editing, ...d } : b)
        : [...bs, { id: nextId(batches), ...d } as Batch]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Lote" onAction={() => { setEditing(undefined); setDialogOpen(true); }} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Produto</TableCell>
              <TableCell>Corte</TableCell>
              <TableCell>Qualidade</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Custo</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(b => {
              const product = products.find(p => p.id === b.product_id);
              const cut = cuts.find(c => c.id === b.cut_id);
              const field = cut ? fields.find(f => f.id === cut.field_id) : undefined;
              return (
                <TableRow key={b.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {b.code ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{product?.name ?? '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {cut ? `${field?.name} #${cut.cut_number}` : '-'}
                  </TableCell>
                  <TableCell>
                    {b.quality_grade && (
                      <Chip label={b.quality_grade} size="small" fontWeight={700}
                        color={QUALITY_COLOR[b.quality_grade] ?? 'default'}
                        sx={{ height: 20, fontWeight: 700 }} />
                    )}
                  </TableCell>
                  <TableCell>{fmtDate(b.batch_date)}</TableCell>
                  <TableCell>
                    {b.status && (
                      <Chip label={b.status} size="small"
                        color={BATCH_STATUS_COLOR[b.status] ?? 'default'} sx={{ height: 20 }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>{fmtBRL(b.cost ?? 0)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => { setEditing(b); setDialogOpen(true); }}
                      onDelete={() => setBatches(bs => bs.filter(x => x.id !== b.id))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={8} />}
          </TableBody>
        </Table>
      </Card>

      <BatchDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSave={handleSave} />
    </Box>
  );
}
