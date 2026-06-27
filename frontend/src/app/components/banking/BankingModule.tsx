import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip, Divider, Avatar,
  Table, TableBody, TableCell, TableHead, TableRow, LinearProgress,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import type { BankAccount } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { BankAccountDialog } from './BankAccountDialog';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

const BANK_COLORS: Record<string, string> = {
  'Banco do Brasil': '#F9D71C',
  'Sicoob': '#004A9F',
  'Caixa Econômica Federal': '#0066B3',
  'Bradesco': '#CC092F',
  'Itaú': '#F77F00',
  'Santander': '#EC0000',
  'Nubank': '#820AD1',
};

function BankCard({ ba, onEdit, onDelete }: {
  ba: BankAccount; onEdit: () => void; onDelete: () => void;
}) {
  const { fulfillments, bankTransfers } = useApp();
  const color = BANK_COLORS[ba.financial_institution ?? ''] ?? '#2E7D32';
  const paymentsCount = fulfillments.filter(f => f.bank_account_id === ba.id).length;
  const transfersCount = bankTransfers.filter(t =>
    t.source_bank_account_id === ba.id || t.destination_bank_account_id === ba.id
  ).length;

  return (
    <Card sx={{ width: 280, opacity: ba.active ? 1 : 0.6 }}>
      <Box sx={{ height: 6, bgcolor: color, borderRadius: '8px 8px 0 0' }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: color + '22', color, width: 36, height: 36 }}>
              <AccountBalanceIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                {ba.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">{ba.financial_institution}</Typography>
            </Box>
          </Stack>
          {!ba.active && (
            <Chip label="Inativa" size="small" color="default" sx={{ height: 18, fontSize: '0.66rem' }} />
          )}
        </Stack>

        <Stack direction="row" spacing={2} mb={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">Agência</Typography>
            <Typography variant="body2">{ba.agency ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Conta</Typography>
            <Typography variant="body2">{ba.account_number ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Tipo</Typography>
            <Typography variant="body2">{ba.account_type ?? '-'}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="caption" color="text.secondary">Saldo Inicial</Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {fmtBRL(ba.initial_balance ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              em {fmtDate(ba.initial_balance_date)}
            </Typography>
          </Box>
          <RowActions onEdit={onEdit} onDelete={onDelete} />
        </Stack>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip label={`${paymentsCount} pgtos`} size="small" variant="outlined"
            sx={{ height: 18, fontSize: '0.66rem' }} />
          <Chip label={`${transfersCount} transf.`} size="small" variant="outlined"
            sx={{ height: 18, fontSize: '0.66rem' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function BankingModule() {
  const { bankAccounts, setBankAccounts, fulfillments, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | undefined>();

  const totalBalance = bankAccounts
    .filter(b => b.active)
    .reduce((s, b) => s + (b.initial_balance ?? 0), 0);

  const handleSave = (d: Partial<BankAccount>) => {
    setBankAccounts(bas =>
      editing
        ? bas.map(ba => ba.id === editing.id ? { ...editing, ...d } : ba)
        : [...bas, { id: nextId(bankAccounts), active: true, ...d } as BankAccount]
    );
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (fulfillments.some(f => f.bank_account_id === id)) {
      alert('Esta conta possui pagamentos vinculados e não pode ser excluída.');
      return;
    }
    setBankAccounts(bas => bas.filter(b => b.id !== id));
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Conta" onAction={() => { setEditing(undefined); setDialogOpen(true); }}>
        <Box sx={{ px: 2.5, py: 1, bgcolor: '#E3F2FD', borderRadius: 1, borderLeft: '4px solid #1565C0' }}>
          <Typography variant="caption" color="text.secondary">Saldo Total (contas ativas)</Typography>
          <Typography variant="h5" color="primary.dark" fontWeight={700}>{fmtBRL(totalBalance)}</Typography>
        </Box>
      </PageHeader>

      {/* Cards */}
      <Stack direction="row" flexWrap="wrap" gap={2} mb={2.5}>
        {bankAccounts.map(ba => (
          <BankCard
            key={ba.id}
            ba={ba}
            onEdit={() => { setEditing(ba); setDialogOpen(true); }}
            onDelete={() => handleDelete(ba.id)}
          />
        ))}
      </Stack>

      {/* Table */}
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Instituição</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Agência</TableCell>
              <TableCell>Conta</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Saldo Inicial</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bankAccounts.map(ba => (
              <TableRow key={ba.id}>
                <TableCell><Typography variant="body2" fontWeight={500}>{ba.name}</Typography></TableCell>
                <TableCell>{ba.financial_institution ?? '-'}</TableCell>
                <TableCell>{ba.account_type ?? '-'}</TableCell>
                <TableCell>{ba.agency ?? '-'}</TableCell>
                <TableCell>{ba.account_number ?? '-'}</TableCell>
                <TableCell>
                  <Chip label={ba.active ? 'Ativa' : 'Inativa'} size="small"
                    color={ba.active ? 'success' : 'default'} sx={{ height: 20 }} />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {fmtBRL(ba.initial_balance ?? 0)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => { setEditing(ba); setDialogOpen(true); }}
                    onDelete={() => handleDelete(ba.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <BankAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        editing={editing} onSave={handleSave} />
    </Box>
  );
}
