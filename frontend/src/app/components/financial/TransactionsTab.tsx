import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBankAccountsData } from '../../../domains/banking/ui/hooks';
import type {
  FinancialTransaction,
  FinancialTransactionFulfillmentInput,
  FinancialTransactionInput,
} from '../../../domains/financial/model/entities';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import {
  selectCounterpartyLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import {
  FulfillmentDialog,
} from './FulfillmentDialog';
import {
  TransactionDialog,
  type TransactionFormData,
} from './TransactionDialog';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const STATUS_COLOR: Record<
  string,
  'success' | 'warning' | 'error' | 'info'
> = {
  PAID: 'success',
  PENDING: 'warning',
  CANCELED: 'error',
  PARTIAL: 'info',
};

const STATUS_LABEL: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  CANCELED: 'Cancelado',
  PARTIAL: 'Parcial',
};

function toFinancialTransactionInput(
  form: TransactionFormData,
): FinancialTransactionInput {
  return {
    description: form.description,
    counterpartyId: form.counterpartyId ? Number(form.counterpartyId) : undefined,
    issueDate: form.issueDate || undefined,
    dueDate: form.dueDate || undefined,
    documentNumber: form.documentNumber || undefined,
    status: form.status as FinancialTransaction['status'],
    type: form.type as FinancialTransaction['type'],
    observation: form.observation || undefined,
    hasNf: form.hasNf,
    totalAmount: form.totalAmount ? Number(form.totalAmount) : undefined,
  };
}

export function TransactionsTab() {
  const { activeBankAccounts } = useBankAccountsData();
  const {
    financialTransactions,
  } = useFinancialCatalogData();
  const {
    createFinancialTransaction,
    updateFinancialTransaction,
    deleteFinancialTransaction,
    createFinancialTransactionFulfillment,
  } = useFinancialMutations();
  const { catalog, counterparties } = useMasterDataCatalogData();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>(
    'ALL',
  );
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | undefined>();
  const [fulfillTarget, setFulfillTarget] = useState<
    FinancialTransaction | undefined
  >();

  const today = new Date();

  const filtered = useMemo(() => {
    let list = financialTransactions;

    if (typeFilter !== 'ALL') {
      list = list.filter(
        (financialTransaction) => financialTransaction.type === typeFilter,
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter(
        (financialTransaction) => financialTransaction.status === statusFilter,
      );
    }

    return [...list].sort((left, right) =>
      (right.issueDate ?? '').localeCompare(left.issueDate ?? ''),
    );
  }, [financialTransactions, statusFilter, typeFilter]);

  const totals = useMemo(
    () => ({
      income: filtered
        .filter((financialTransaction) => financialTransaction.type === 'INCOME')
        .reduce(
          (sum, financialTransaction) =>
            sum + (financialTransaction.totalAmount ?? 0),
          0,
        ),
      expense: filtered
        .filter((financialTransaction) => financialTransaction.type === 'EXPENSE')
        .reduce(
          (sum, financialTransaction) =>
            sum + (financialTransaction.totalAmount ?? 0),
          0,
        ),
    }),
    [filtered],
  );

  const handleSave = async (form: TransactionFormData) => {
    const input = toFinancialTransactionInput(form);

    if (editing) {
      await updateFinancialTransaction.mutateAsync({ id: editing.id, input });
    } else {
      await createFinancialTransaction.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleFulfill = async (
    bankId: number,
    date: string,
    amount: number,
    observation: string,
  ) => {
    if (!fulfillTarget) return;

    const input: FinancialTransactionFulfillmentInput = {
      financialTransactionId: fulfillTarget.id,
      bankAccountId: bankId,
      paymentDate: date,
      amountPaid: amount,
      observation: observation || undefined,
    };

    await createFinancialTransactionFulfillment.mutateAsync(input);
    setFulfillTarget(undefined);
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Transacao"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <ToggleButtonGroup
          value={typeFilter}
          exclusive
          size="small"
          onChange={(_, value) => value && setTypeFilter(value)}
        >
          <ToggleButton value="ALL" sx={{ px: 2, fontSize: '0.76rem' }}>
            Todas
          </ToggleButton>
          <ToggleButton value="INCOME" sx={{ px: 2, fontSize: '0.76rem' }}>
            Receitas
          </ToggleButton>
          <ToggleButton value="EXPENSE" sx={{ px: 2, fontSize: '0.76rem' }}>
            Despesas
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(event) => setStatusFilter(event.target.value)}
          >
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
          <Typography variant="caption" color="text.secondary">
            Total Receitas
          </Typography>
          <Typography variant="subtitle2" color="success.main" fontWeight={700}>
            {fmtBRL(totals.income)}
          </Typography>
        </Paper>
        <Paper sx={{ px: 2, py: 1, borderLeft: '3px solid #D32F2F', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Total Despesas
          </Typography>
          <Typography variant="subtitle2" color="error.main" fontWeight={700}>
            {fmtBRL(totals.expense)}
          </Typography>
        </Paper>
        <Paper sx={{ px: 2, py: 1, borderLeft: '3px solid #1565C0', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Saldo Periodo
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              color:
                totals.income - totals.expense >= 0
                  ? 'success.main'
                  : 'error.main',
            }}
          >
            {fmtBRL(totals.income - totals.expense)}
          </Typography>
        </Paper>
      </Stack>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Descricao</TableCell>
              <TableCell>Contraparte</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Emissao</TableCell>
              <TableCell>Vencimento</TableCell>
              <TableCell>NF</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Valor</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((financialTransaction) => {
              const counterpartyLabel = selectCounterpartyLabelById(
                catalog,
                financialTransaction.counterpartyId,
              );
              const isOverdue =
                financialTransaction.dueDate &&
                new Date(financialTransaction.dueDate) < today &&
                financialTransaction.status !== 'PAID' &&
                financialTransaction.status !== 'CANCELED';
              const isPending =
                financialTransaction.status === 'PENDING' ||
                financialTransaction.status === 'PARTIAL';

              return (
                <TableRow key={financialTransaction.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {financialTransaction.description}
                    </Typography>
                    {financialTransaction.documentNumber && (
                      <Typography variant="caption" color="text.secondary">
                        {financialTransaction.documentNumber}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 150,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {counterpartyLabel}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      sx={{ height: 20 }}
                      label={
                        financialTransaction.type === 'INCOME'
                          ? 'Receita'
                          : 'Despesa'
                      }
                      color={
                        financialTransaction.type === 'INCOME'
                          ? 'success'
                          : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>{fmtDate(financialTransaction.issueDate)}</TableCell>
                  <TableCell
                    sx={{
                      color: isOverdue ? 'error.main' : 'inherit',
                      fontWeight: isOverdue ? 600 : 400,
                    }}
                  >
                    {fmtDate(financialTransaction.dueDate)}
                  </TableCell>
                  <TableCell>
                    {financialTransaction.hasNf && (
                      <Chip
                        label="NF"
                        size="small"
                        color="info"
                        sx={{ height: 18, fontSize: '0.66rem' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_LABEL[financialTransaction.status]}
                      size="small"
                      color={STATUS_COLOR[financialTransaction.status]}
                      sx={{ height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color:
                          financialTransaction.type === 'INCOME'
                            ? 'success.main'
                            : 'error.main',
                      }}
                    >
                      {fmtBRL(financialTransaction.totalAmount ?? 0)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => {
                        setEditing(financialTransaction);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        void deleteFinancialTransaction.mutateAsync(
                          financialTransaction.id,
                        );
                      }}
                      extraActions={
                        isPending ? (
                          <Tooltip title="Registrar Pagamento">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setFulfillTarget(financialTransaction)}
                            >
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        ) : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <EmptyTableRow
                colSpan={9}
                message="Nenhuma transacao encontrada."
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        counterparties={counterparties}
        saving={
          createFinancialTransaction.isPending ||
          updateFinancialTransaction.isPending
        }
        onSave={(form) => {
          void handleSave(form);
        }}
      />
      <FulfillmentDialog
        open={!!fulfillTarget}
        onClose={() => setFulfillTarget(undefined)}
        transaction={fulfillTarget}
        activeBankAccounts={activeBankAccounts}
        saving={createFinancialTransactionFulfillment.isPending}
        onSave={(bankId, date, amount, observation) => {
          void handleFulfill(bankId, date, amount, observation);
        }}
      />
    </Box>
  );
}
