import { useState } from 'react';
import {
  Box, Card, Typography, Chip, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import type { Cut } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { CutDialog } from './CutDialog';

const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

export function CutsTab() {
  const { cuts, setCuts, fields, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cut | undefined>();
  const sorted = [...cuts].sort((a, b) => (b.cut_date ?? '').localeCompare(a.cut_date ?? ''));

  const handleSave = (d: Partial<Cut>) => {
    setCuts(cs =>
      editing
        ? cs.map(c => c.id === editing.id ? { ...editing, ...d } : c)
        : [...cs, { id: nextId(cuts), ...d } as Cut]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Corte" onAction={() => { setEditing(undefined); setDialogOpen(true); }} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Campo</TableCell>
              <TableCell>Nº Corte</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Dias desde último</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(c => {
              const field = fields.find(f => f.id === c.field_id);
              return (
                <TableRow key={c.id}>
                  <TableCell><Typography variant="body2" fontWeight={500}>{field?.name ?? '-'}</Typography></TableCell>
                  <TableCell>
                    <Chip label={`#${c.cut_number ?? '-'}`} size="small" color="primary" sx={{ height: 20 }} />
                  </TableCell>
                  <TableCell>{fmtDate(c.cut_date)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {c.days_since_last_cut ? `${c.days_since_last_cut} dias` : '-'}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {c.observation ?? '-'}
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => { setEditing(c); setDialogOpen(true); }}
                      onDelete={() => setCuts(cs => cs.filter(x => x.id !== c.id))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={6} />}
          </TableBody>
        </Table>
      </Card>

      <CutDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSave={handleSave} />
    </Box>
  );
}
