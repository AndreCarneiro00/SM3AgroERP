import React from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getCounterpartyName } from '../data/display';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'error',
  PARTIAL: 'info',
};

const STATUS_LABELS: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  CANCELED: 'Cancelado',
  PARTIAL: 'Parcial',
};

const INVENTORY_STATUS_COLORS = ['#2E7D32', '#1565C0', '#F9A825', '#D32F2F'];

const chartData = [
  { month: 'Jan', income: 38000, expense: 22000 },
  { month: 'Fev', income: 42000, expense: 19000 },
  { month: 'Mar', income: 55000, expense: 31000 },
  { month: 'Abr', income: 48000, expense: 25000 },
  { month: 'Mai', income: 64000, expense: 28000 },
  { month: 'Jun', income: 84450, expense: 35100 },
];

function isTransactionOverdue(dueDate?: string, status?: string) {
  if (!dueDate || status === 'PAID' || status === 'CANCELED') return false;
  return new Date(`${dueDate}T23:59:59`) < new Date();
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <Card sx={{ flex: 1, minWidth: 180 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
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
          <Avatar sx={{ bgcolor: `${color}18`, color, width: 40, height: 40 }}>
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

export function Dashboard() {
  const {
    financialTransactions,
    bankAccounts,
    inventoryBatches,
    productionBatches,
    counterparties,
    setCurrentPage,
  } = useApp();

  const openIncome = financialTransactions
    .filter((transaction) => transaction.type === 'INCOME' && (transaction.status === 'PENDING' || transaction.status === 'PARTIAL'))
    .reduce((sum, transaction) => sum + (transaction.total_amount ?? 0), 0);

  const openExpenses = financialTransactions
    .filter((transaction) => transaction.type === 'EXPENSE' && (transaction.status === 'PENDING' || transaction.status === 'PARTIAL'))
    .reduce((sum, transaction) => sum + (transaction.total_amount ?? 0), 0);

  const bankBalance = bankAccounts
    .filter((account) => account.active)
    .reduce((sum, account) => sum + (account.initial_balance ?? 0), 0);

  const activeInventoryBatches = inventoryBatches.filter((batch) => batch.status === 'ACTIVE').length;

  const overdueTransactions = financialTransactions.filter((transaction) =>
    isTransactionOverdue(transaction.due_date, transaction.status)
  );

  const recentTransactions = [...financialTransactions]
    .sort((left, right) => (right.issue_date ?? '').localeCompare(left.issue_date ?? ''))
    .slice(0, 8);

  const batchStatusCounts = [
    { name: 'Ativos', value: inventoryBatches.filter((batch) => batch.status === 'ACTIVE').length },
    { name: 'Vendidos', value: inventoryBatches.filter((batch) => batch.status === 'SOLD').length },
    { name: 'Consumidos', value: inventoryBatches.filter((batch) => batch.status === 'CONSUMED').length },
    { name: 'Cancelados', value: inventoryBatches.filter((batch) => batch.status === 'CANCELED').length },
  ].filter((entry) => entry.value > 0);

  return (
    <Box>
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2.5 }}>
        <KpiCard
          title="A Receber"
          value={fmtBRL(openIncome)}
          subtitle={`${financialTransactions.filter((transaction) => transaction.type === 'INCOME' && transaction.status === 'PENDING').length} transacoes`}
          icon={<TrendingUpIcon />}
          color="#2E7D32"
          trend="Receitas em aberto"
        />
        <KpiCard
          title="A Pagar"
          value={fmtBRL(openExpenses)}
          subtitle={`${financialTransactions.filter((transaction) => transaction.type === 'EXPENSE' && transaction.status === 'PENDING').length} transacoes`}
          icon={<TrendingDownIcon />}
          color="#D32F2F"
        />
        <KpiCard
          title="Saldo Bancario"
          value={fmtBRL(bankBalance)}
          subtitle={`${bankAccounts.filter((account) => account.active).length} contas ativas`}
          icon={<AccountBalanceIcon />}
          color="#1565C0"
        />
        <KpiCard
          title="Lotes Ativos"
          value={String(activeInventoryBatches)}
          subtitle={`${productionBatches.length} lotes de producao`}
          icon={<AgricultureIcon />}
          color="#F9A825"
        />
      </Stack>

      {overdueTransactions.length > 0 && (
        <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#FFF3E0', border: '1px solid #FFB74D' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningAmberIcon sx={{ color: '#F57C00', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#E65100', fontWeight: 600 }}>
              {overdueTransactions.length} transacoes vencidas. Revise a area financeira.
            </Typography>
          </Stack>
        </Paper>
      )}

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <Card sx={{ flex: 2 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Receitas vs Despesas (2025)
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => fmtBRL(value)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="income" name="Receitas" fill="#2E7D32" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Despesas" fill="#D32F2F" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
              Saldo por Conta
            </Typography>
            <Stack spacing={1.5}>
              {bankAccounts.filter((account) => account.active).map((account) => (
                <Box key={account.id}>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                        {account.name.split(' - ')[1] || account.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {account.financial_institution ?? '-'} - {account.account_type ?? '-'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {fmtBRL(account.initial_balance ?? 0)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={bankBalance > 0 ? Math.min(((account.initial_balance ?? 0) / bankBalance) * 100, 100) : 0}
                    sx={{ height: 4, borderRadius: 2, bgcolor: '#E8F5E9' }}
                    color="success"
                  />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Status dos Lotes de Estoque
            </Typography>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie
                  data={batchStatusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {batchStatusCounts.map((_, index) => (
                    <Cell key={index} fill={INVENTORY_STATUS_COLORS[index % INVENTORY_STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Stack spacing={0.5} mt={0.5}>
              {batchStatusCounts.map((entry, index) => (
                <Stack key={entry.name} direction="row" alignItems="center" spacing={0.75}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: INVENTORY_STATUS_COLORS[index % INVENTORY_STATUS_COLORS.length],
                    }}
                  />
                  <Typography variant="caption">
                    {entry.name}: {entry.value}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Card>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 0 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              Transacoes Recentes
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'primary.main', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => setCurrentPage('financial-transactions')}
            >
              Ver todas {'>'}
            </Typography>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Descricao</TableCell>
                <TableCell>Contraparte</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Vencimento</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Valor</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentTransactions.map((transaction) => {
                const counterparty = counterparties.find((entry) => entry.id === transaction.counterparty_id);
                const overdue = isTransactionOverdue(transaction.due_date, transaction.status);

                return (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {transaction.status === 'PAID' && (
                          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        )}
                        <Typography variant="body2">{transaction.description}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {getCounterpartyName(counterparty)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        size="small"
                        color={transaction.type === 'INCOME' ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ height: 20 }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: overdue ? 'error.main' : 'inherit' }}>
                      {fmtDate(transaction.due_date)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[transaction.status]}
                        size="small"
                        color={STATUS_COLORS[transaction.status]}
                        sx={{ height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: transaction.type === 'INCOME' ? 'success.main' : 'error.main' }}
                      >
                        {fmtBRL(transaction.total_amount ?? 0)}
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
