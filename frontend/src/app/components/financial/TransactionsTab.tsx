import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Stack, Chip, IconButton, Tooltip, Paper,
  Table, TableBody, TableCell, TableHead, TableRow,
  FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { FinancialTransaction } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { TransactionDialog, type TransactionFormData } from './TransactionDialog';
import { FulfillmentDialog } from './FulfillmentDialog';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s?: string) => s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  PAID: 'success', PENDING: 'warning', CANCELED: 'error', PARTIAL: 'info',
};
const STATUS_LABEL: Record<string, string> = {
  PAID: 'Pago', PENDING: 'Pendente', CANCELED: 'Cancelado', PARTIAL: 'Parcial',
};

export function TransactionsTab() {
  const {
    financialTransactions, setFinancialTransactions,
    fulfillments, setFulfillments,
    counterparties, nextId,
  } = useApp();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | undefined>();
  const [fulfillTarget, setFulfillTarget] = useState<FinancialTransaction | undefined>();

  const today = new Date();

  const filtered = useMemo(() => {
    let list = financialTransactions;
    if (typeFilter !== 'ALL') list = list.filter(t => t.type === typeFilter);
    if (statusFilter !== 'ALL') list = list.filter(t => t.status === statusFilter);
    return [...list].sort((a, b) => (b.issue_date ?? '').localeCompare(a.issue_date ?? ''));
  }, [financialTransactions, typeFilter, statusFilter]);

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.type === 'INCOME').reduce((s, t) => s + (t.total_amount ?? 0), 0),
    expense: filtered.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + (t.total_amount ?? 0), 0),
  }), [filtered]);

  const handleSave = (d: TransactionFormData) => {
    const tx: FinancialTransaction = {
      id: editing?.id ?? nextId(financialTransactions),
      description: d.description,
      counterparty_id: d.counterparty_id ? Number(d.counterparty_id) : undefined,
      issue_date: d.issue_date || undefined,
      due_date: d.due_date || undefined,
      document_number: d.document_number || undefined,
      status: d.status as FinancialTransaction['status'],
      type: d.type as FinancialTransaction['type'],
      observation: d.observation || undefined,
      document_type_id: d.document_type_id ? Number(d.document_type_id) : undefined,
      has_NF: d.has_NF,
      total_amount: d.total_amount ? Number(d.total_amount) : undefined,
    };
    setFinancialTransactions(ts =>
      editing ? ts.map(t => t.id === editing.id ? tx : t) : [...ts, tx]
    );
    setDialogOpen(false);
  };

  const handleFulfill = (bankId: number, date: string, amount: number, obs: string) => {
    if (!fulfillTarget) return;
    const txId = fulfillTarget.id;
    setFulfillments(fs => [...fs, {
      id: nextId(fulfillments), financial_transaction_id: txId,
      bank_account_id: bankId, payment_date: date, amount_paid: amount,
      observation: obs || undefined,
    }]);
    setFinancialTransactions(ts => ts.map(t => {
      if (t.id !== txId) return t;
      const paid = fulfillments
        .filter(f => f.financial_transaction_id === txId)
        .reduce((s, f) => s + f.amount_paid, 0) + amount;
      return { ...t, status: paid >= (t.total_amount ?? 0) ? 'PAID' : 'PARTIAL' };
    }));
    setFulfillTarget(undefined);
  };

  const openCreate = () => { setEditing(undefined); setDialogOpen(true); };
  const openEdit = (t: FinancialTransaction) => { setEditing(t); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader actionLabel="Nova Transação" onAction={openCreate}>
        <ToggleButtonGroup value={typeFilter} exclusive size="small"
          onChange={(_, v) => v && setTypeFilter(v)}>
          <ToggleButton value="ALL"     sx={{ px: 2, fontSize: '0.76rem' }}>Todas</ToggleButton>
          <ToggleButton value="INCOME"  sx={{ px: 2, fontSize: '0.76rem' }}>Receitas</ToggleButton>
          <ToggleButton value="EXPENSE" sx={{ px: 2, fontSize: '0.76rem' }}>Despesas</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="PENDING">Pendente</MenuItem>
            <MenuItem value="PAID">Pago</MenuItem>
            <MenuItem value="PARTIAL">Parcial</MenuItem>
            <MenuItem value="CANCELED">Cancelado</MenuItem>
          </Select>
        </FormControl>
      </PageHeader>

      <Stack direction="row" spacing={2} mb={1.5}>
        <Paper sx={{ px: 2, py: 1, borderLeft: '3px solid #2E7D32', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Total Receitas</Typography>
          <Typography variant="subtitle2" color="success.main" fontWeight={700}>{fmtBRL(totals.income)}</Typography>
        </Paper>
        <Paper sx={{ px: 2, py: 1, borderLeft: '3px solid #D32F2F', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Total Despesas</Typography>
          <Typography variant="subtitle2" color="error.main" fontWeight={700}>{fmtBRL(totals.expense)}</Typography>
        </Paper>
        <Paper sx={{ px: 2, py: 1, borderLeft: '3px solid #1565C0', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Saldo Período</Typography>
          <Typography variant="subtitle2" fontWeight={700}
            sx={{ color: totals.income - totals.expense >= 0 ? 'success.main' : 'error.main' }}>
            {fmtBRL(totals.income - totals.expense)}
          </Typography>
        </Paper>
      </Stack>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descrição</TableCell>
              <TableCell>Contraparte</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Emissão</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>NF</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(t => {
              const cp = counterparties.find(c => c.id === t.counterparty_id);
              const isOverdue = t.due_date && new Date(t.due_date) < today
                && t.status !== 'PAID' && t.status !== 'CANCELED';
              const isPending = t.status === 'PENDING' || t.status === 'PARTIAL';
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{t.description}</Typography>
                    {t.document_number && (
                      <Typography variant="caption" color="text.secondary">{t.document_number}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2"
                      sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cp?.name ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" sx={{ height: 20 }}
                      label={t.type === 'INCOME' ? 'Receita' : t.type === 'EXPENSE' ? 'Despesa' : 'Transf.'}
                      color={t.type === 'INCOME' ? 'success' : t.type === 'EXPENSE' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>{fmtDate(t.issue_date)}</TableCell>
                  <TableCell sx={{ color: isOverdue ? 'error.main' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                    {fmtDate(t.due_date)}
                  </TableCell>
                  <TableCell>
                    {t.has_NF && (
                      <Chip label="NF" size="small" color="info" sx={{ height: 18, fontSize: '0.66rem' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={STATUS_LABEL[t.status]} size="small"
                      color={STATUS_COLOR[t.status]} sx={{ height: 20 }} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700}
                      sx={{ color: t.type === 'INCOME' ? 'success.main' : 'error.main' }}>
                      {fmtBRL(t.total_amount ?? 0)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => openEdit(t)}
                      onDelete={() => setFinancialTransactions(ts => ts.filter(x => x.id !== t.id))}
                      extraActions={isPending ? (
                        <Tooltip title="Registrar Pagamento">
                          <IconButton size="small" color="success" onClick={() => setFulfillTarget(t)}>
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      ) : undefined}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <EmptyTableRow colSpan={9} message="Nenhuma transação encontrada." />}
          </TableBody>
        </Table>
      </Card>

      <TransactionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSave={handleSave} />
      <FulfillmentDialog open={!!fulfillTarget} onClose={() => setFulfillTarget(undefined)}
        transaction={fulfillTarget} onSave={handleFulfill} />
    </Box>
  );
}
