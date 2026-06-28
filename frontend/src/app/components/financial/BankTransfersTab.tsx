import { useState } from 'react';
import {
  Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import type { BankTransfer } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { BankTransferDialog } from './BankTransferDialog';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');

export function BankTransfersTab() {
  const { bankTransfers, setBankTransfers, bankAccounts, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankTransfer | undefined>();
  const sorted = [...bankTransfers].sort((a, b) => b.transfer_date.localeCompare(a.transfer_date));

  const handleSave = (d: Partial<BankTransfer>) => {
    setBankTransfers(ts =>
      editing
        ? ts.map(t => t.id === editing.id ? { ...editing, ...d } : t)
        : [...ts, { id: nextId(ts), ...d } as BankTransfer]
    );
    setDialogOpen(false);
  };

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (bt: BankTransfer) => { setEditing(bt); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader actionLabel="Nova Transferência" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta Origem</TableCell>
              <TableCell>Conta Destino</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(bt => {
              const src = bankAccounts.find(b => b.id === bt.source_bank_account_id);
              const dst = bankAccounts.find(b => b.id === bt.destination_bank_account_id);
              return (
                <TableRow key={bt.id}>
                  <TableCell>{src?.name ?? '-'}</TableCell>
                  <TableCell>{dst?.name ?? '-'}</TableCell>
                  <TableCell>{fmtDate(bt.transfer_date)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{bt.observation ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700} color="info.main">
                      {fmtBRL(bt.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => openEdit(bt)}
                      onDelete={() => setBankTransfers(ts => ts.filter(t => t.id !== bt.id))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={6} message="Nenhuma transferência encontrada." />}
          </TableBody>
        </Table>
      </Card>

      <BankTransferDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        editing={editing} onSave={handleSave} />
    </Box>
  );
}
