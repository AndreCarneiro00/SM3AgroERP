import React from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Paper,
  Avatar, LinearProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (s?: string) =>
  s ? new Date(s + 'T12:00:00').toLocaleDateString('pt-BR') : '-';

function KpiCard({
  title, value, subtitle, icon, color, trend,
}: {
  title: string; value: string; subtitle?: string;
  icon: React.ReactNode; color: string; trend?: string;
}) {
  return (
    <Card sx={{ flex: 1, minWidth: 180 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color + '18', color, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Stack>
        {trend && (
          <Typography variant="caption" sx={{ color: 'success.main', mt: 0.5, display: 'block' }}>
            {trend}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  PAID: 'success', PENDING: 'warning', CANCELED: 'error', PARTIAL: 'info',
};
const STATUS_LABELS: Record<string, string> = {
  PAID: 'Pago', PENDING: 'Pendente', CANCELED: 'Cancelado', PARTIAL: 'Parcial',
};

const chartData = [
  { mes: 'Jan', receitas: 38000, despesas: 22000 },
  { mes: 'Fev', receitas: 42000, despesas: 19000 },
  { mes: 'Mar', receitas: 55000, despesas: 31000 },
  { mes: 'Abr', receitas: 48000, despesas: 25000 },
  { mes: 'Mai', receitas: 64000, despesas: 28000 },
  { mes: 'Jun', receitas: 84450, despesas: 35100 },
];

const BATCH_COLORS = ['#2E7D32', '#F9A825', '#1565C0', '#7B1FA2'];

export function Dashboard() {
  const {
    financialTransactions, bankAccounts, batches, counterparties, setCurrentPage,
  } = useApp();

  const income = financialTransactions
    .filter(t => t.type === 'INCOME' && (t.status === 'PENDING' || t.status === 'PARTIAL'))
    .reduce((s, t) => s + (t.total_amount ?? 0), 0);

  const expenses = financialTransactions
    .filter(t => t.type === 'EXPENSE' && (t.status === 'PENDING' || t.status === 'PARTIAL'))
    .reduce((s, t) => s + (t.total_amount ?? 0), 0);

  const bankBalance = bankAccounts
    .filter(b => b.active)
    .reduce((s, b) => s + (b.initial_balance ?? 0), 0);

  const activeBatches = batches.filter(b => b.status !== 'VENDIDO').length;

  const today = new Date();
  const overdue = financialTransactions.filter(t => {
    if (!t.due_date || t.status === 'PAID' || t.status === 'CANCELED') return false;
    return new Date(t.due_date) < today;
  });

  const recentTransactions = [...financialTransactions]
    .sort((a, b) => (b.issue_date ?? '').localeCompare(a.issue_date ?? ''))
    .slice(0, 8);

  const batchStatusCounts = [
    { name: 'Disponível', value: batches.filter(b => b.status === 'DISPONÍVEL').length },
    { name: 'Vendido', value: batches.filter(b => b.status === 'VENDIDO').length },
    { name: 'Processando', value: batches.filter(b => b.status === 'PROCESSANDO').length },
  ].filter(b => b.value > 0);

  return (
    <Box>
      {/* KPIs */}
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <KpiCard
          title="A Receber"
          value={fmtBRL(income)}
          subtitle={`${financialTransactions.filter(t => t.type === 'INCOME' && t.status === 'PENDING').length} transações`}
          icon={<TrendingUpIcon />}
          color="#2E7D32"
          trend="↑ Receitas em aberto"
        />
        <KpiCard
          title="A Pagar"
          value={fmtBRL(expenses)}
          subtitle={`${financialTransactions.filter(t => t.type === 'EXPENSE' && t.status === 'PENDING').length} transações`}
          icon={<TrendingDownIcon />}
          color="#D32F2F"
        />
        <KpiCard
          title="Saldo Bancário"
          value={fmtBRL(bankBalance)}
          subtitle={`${bankAccounts.filter(b => b.active).length} contas ativas`}
          icon={<AccountBalanceIcon />}
          color="#1565C0"
        />
        <KpiCard
          title="Lotes Ativos"
          value={String(activeBatches)}
          subtitle={`${batches.length} total`}
          icon={<AgricultureIcon />}
          color="#F9A825"
        />
      </Stack>

      {/* Alerts row */}
      {overdue.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#FFF3E0', border: '1px solid #FFB74D' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon sx={{ color: '#F57C00', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#E65100', fontWeight: 600 }}>
              {overdue.length} transação(ões) vencida(s) — verifique a aba de Financeiro.
            </Typography>
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        {/* Bar chart */}
        <Card sx={{ flex: 2 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Receitas vs Despesas (2025)
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtBRL(v)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="receitas" name="Receitas" fill="#2E7D32" radius={[3, 3, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#D32F2F" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bank accounts */}
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Saldo por Conta
            </Typography>
            <Stack spacing={1.5}>
              {bankAccounts.filter(b => b.active).map(ba => (
                <Box key={ba.id}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                        {ba.name.split(' - ')[1] || ba.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {ba.financial_institution} • {ba.account_type}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {fmtBRL(ba.initial_balance ?? 0)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(((ba.initial_balance ?? 0) / bankBalance) * 100, 100)}
                    sx={{ height: 4, borderRadius: 2, bgcolor: '#E8F5E9' }}
                    color="success"
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Lotes pie */}
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Status de Lotes
            </Typography>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={batchStatusCounts} cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                  dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}>
                  {batchStatusCounts.map((_, idx) => (
                    <Cell key={idx} fill={BATCH_COLORS[idx % BATCH_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={0.5} mt={0.5}>
              {batchStatusCounts.map((b, i) => (
                <Stack key={b.name} direction="row" alignItems="center" spacing={0.75}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: BATCH_COLORS[i] }} />
                  <Typography variant="caption">{b.name}: {b.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Recent transactions */}
      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 0 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>Transações Recentes</Typography>
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setCurrentPage('financial-transactions')}
            >
              Ver todas →
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descrição</TableCell>
                <TableCell>Contraparte</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map(t => {
                const cp = counterparties.find(c => c.id === t.counterparty_id);
                const isOverdue = t.due_date && new Date(t.due_date) < today && t.status !== 'PAID' && t.status !== 'CANCELED';
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {t.status === 'PAID' && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                        <Typography variant="body2">{t.description}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{cp?.name ?? '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={t.type === 'INCOME' ? 'Receita' : t.type === 'EXPENSE' ? 'Despesa' : 'Transf.'}
                        size="small"
                        color={t.type === 'INCOME' ? 'success' : t.type === 'EXPENSE' ? 'error' : 'default'}
                        variant="outlined"
                        sx={{ height: 20 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: isOverdue ? 'error.main' : 'inherit' }}>
                      {fmtDate(t.due_date)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[t.status]}
                        size="small"
                        color={STATUS_COLORS[t.status]}
                        sx={{ height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}
                        sx={{ color: t.type === 'INCOME' ? 'success.main' : 'error.main' }}>
                        {fmtBRL(t.total_amount ?? 0)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
