import { Fragment, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
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
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { extractApiErrorMessage } from '../../../core/http/client';
import { selectChartOfAccountLabelById, selectCostCenterLabelById } from '../../../domains/accounting/selectors/selectors';
import { useAccountingCatalogData } from '../../../domains/accounting/ui/hooks';
import { selectBankAccountLabelById } from '../../../domains/banking/selectors/selectors';
import { useBankAccountsData } from '../../../domains/banking/ui/hooks';
import type {
  CreateFinancialTransactionInput,
  FinancialTransaction,
  FinancialTransactionAttachment,
  FinancialTransactionAttachmentInput,
  FinancialTransactionFulfillment,
  FinancialTransactionFulfillmentAllocationInput,
  FinancialTransactionFulfillmentInput,
  FinancialTransactionInput,
  FinancialTransactionItem,
  FinancialTransactionItemInput,
} from '../../../domains/financial/model/entities';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import {
  selectCounterpartyLabelById,
  selectDocumentTypeLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { FulfillmentDialog } from './FulfillmentDialog';
import { TransactionAttachmentDialog } from './TransactionAttachmentDialog';
import {
  TransactionDialog,
  type TransactionFormData,
} from './TransactionDialog';
import { TransactionItemDialog } from './TransactionItemDialog';

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
    counterpartyId: form.counterpartyId,
    issueDate: form.issueDate || undefined,
    dueDate: form.dueDate || undefined,
    documentNumber: form.documentNumber || undefined,
    type: form.type,
    observation: form.observation || undefined,
    hasNf: form.hasNf,
  };
}

function toCreateFinancialTransactionInput(
  form: TransactionFormData,
): CreateFinancialTransactionInput {
  return {
    ...toFinancialTransactionInput(form),
    items: form.items.map((item) => ({
      chartOfAccountId: item.chartOfAccountId,
      costCenterId: item.costCenterId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
      productId: item.productId,
    })),
    fulfillments: form.fulfillments.map((fulfillment) => ({
      bankAccountId: fulfillment.bankAccountId ?? 0,
      paymentDate: fulfillment.paymentDate,
      amountPaid: fulfillment.amountPaid ?? 0,
      allocations: fulfillment.allocations ?? [],
      observation: fulfillment.observation,
    })),
    attachments: form.attachments,
  };
}

function getProductName(
  productsCatalog: ReturnType<typeof useProductsCatalogData>['catalog'],
  productId?: number,
) {
  return productsCatalog.products.byId[productId ?? -1]?.name ?? '-';
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildFulfillmentAllocationsByItemId(
  items: FinancialTransactionItem[],
  fulfillments: FinancialTransactionFulfillment[],
  paymentAmount: number,
  editingFulfillmentId?: number,
): FinancialTransactionFulfillmentAllocationInput[] | undefined {
  let remainingPayment = roundCurrency(paymentAmount);
  const allocatedByItemId = new Map<number, number>();

  fulfillments
    .filter((fulfillment) => fulfillment.id !== editingFulfillmentId)
    .forEach((fulfillment) => {
      fulfillment.allocations.forEach((allocation) => {
        if (!allocation.itemId) {
          return;
        }

        allocatedByItemId.set(
          allocation.itemId,
          roundCurrency(
            (allocatedByItemId.get(allocation.itemId) ?? 0) +
              allocation.amount,
          ),
        );
      });
    });

  const allocations: FinancialTransactionFulfillmentAllocationInput[] = [];

  [...items]
    .sort((left, right) => left.id - right.id)
    .forEach((item) => {
      if (remainingPayment <= 0) {
        return;
      }

      const itemAmount = roundCurrency(item.amount ?? 0);
      const alreadyAllocated = allocatedByItemId.get(item.id) ?? 0;
      const availableAmount = roundCurrency(itemAmount - alreadyAllocated);

      if (availableAmount <= 0) {
        return;
      }

      const allocatedAmount = roundCurrency(
        Math.min(availableAmount, remainingPayment),
      );

      allocations.push({
        itemId: item.id,
        amount: allocatedAmount,
      });
      remainingPayment = roundCurrency(remainingPayment - allocatedAmount);
    });

  if (remainingPayment > 0.009) {
    return undefined;
  }

  return allocations;
}

export function TransactionsTab() {
  const {
    financialTransactions,
    financialTransactionAttachments,
    financialTransactionFulfillments,
    financialTransactionItems,
  } = useFinancialCatalogData();
  const {
    createFinancialTransaction,
    updateFinancialTransaction,
    deleteFinancialTransaction,
    createFinancialTransactionItem,
    updateFinancialTransactionItem,
    deleteFinancialTransactionItem,
    createFinancialTransactionFulfillment,
    updateFinancialTransactionFulfillment,
    deleteFinancialTransactionFulfillment,
    createFinancialTransactionAttachment,
    updateFinancialTransactionAttachment,
    replaceFinancialTransactionAttachmentFile,
    deleteFinancialTransactionAttachment,
  } = useFinancialMutations();
  const { activeBankAccounts, catalog: bankCatalog } = useBankAccountsData();
  const {
    catalog: accountingCatalog,
    postableChartOfAccounts,
    postableCostCenters,
  } = useAccountingCatalogData();
  const {
    catalog: masterCatalog,
    counterparties,
    documentTypes,
  } = useMasterDataCatalogData();
  const { catalog: productsCatalog, products } = useProductsCatalogData();

  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>(
    'ALL',
  );
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | undefined>();
  const [fulfillTarget, setFulfillTarget] = useState<
    FinancialTransaction | undefined
  >();
  const [editingFulfillment, setEditingFulfillment] = useState<
    FinancialTransactionFulfillment | undefined
  >();
  const [itemTarget, setItemTarget] = useState<FinancialTransaction | undefined>();
  const [editingItem, setEditingItem] = useState<
    FinancialTransactionItem | undefined
  >();
  const [attachmentTarget, setAttachmentTarget] = useState<
    FinancialTransaction | undefined
  >();
  const [editingAttachment, setEditingAttachment] = useState<
    FinancialTransactionAttachment | undefined
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
    try {
      if (editing) {
        await updateFinancialTransaction.mutateAsync({
          id: editing.id,
          input: toFinancialTransactionInput(form),
        });
      } else {
        await createFinancialTransaction.mutateAsync(
          toCreateFinancialTransactionInput(form),
        );
      }

      setDialogOpen(false);
      setEditing(undefined);
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ??
          'Nao foi possivel salvar a transacao.',
      );
    }
  };

  const handleFulfill = async (
    bankId: number,
    date: string,
    amount: number,
    observation: string,
  ) => {
    if (!fulfillTarget) return;

    const transactionItems = financialTransactionItems.filter(
      (item) => item.financialTransactionId === fulfillTarget.id,
    );
    const transactionFulfillments = financialTransactionFulfillments.filter(
      (fulfillment) => fulfillment.financialTransactionId === fulfillTarget.id,
    );
    const allocations = buildFulfillmentAllocationsByItemId(
      transactionItems,
      transactionFulfillments,
      amount,
      editingFulfillment?.id,
    );

    if (!allocations) {
      window.alert('O valor pago nao pode exceder o saldo dos items.');
      return;
    }

    const input: FinancialTransactionFulfillmentInput = {
      financialTransactionId: fulfillTarget.id,
      bankAccountId: bankId,
      paymentDate: date,
      amountPaid: amount,
      allocations,
      observation: observation || undefined,
    };

    try {
      if (editingFulfillment) {
        await updateFinancialTransactionFulfillment.mutateAsync({
          id: editingFulfillment.id,
          input,
        });
      } else {
        await createFinancialTransactionFulfillment.mutateAsync(input);
      }

      setFulfillTarget(undefined);
      setEditingFulfillment(undefined);
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ??
          'Nao foi possivel registrar o pagamento.',
      );
    }
  };

  const handleSaveItem = async (input: FinancialTransactionItemInput) => {
    if (!itemTarget) return;

    const payload = { ...input, financialTransactionId: itemTarget.id };

    if (editingItem) {
      await updateFinancialTransactionItem.mutateAsync({
        id: editingItem.id,
        input: payload,
      });
    } else {
      await createFinancialTransactionItem.mutateAsync(payload);
    }

    setItemTarget(undefined);
    setEditingItem(undefined);
  };

  const handleSaveAttachment = async (
    input: FinancialTransactionAttachmentInput,
  ) => {
    if (!attachmentTarget) return;

    const payload = {
      ...input,
      financialTransactionId: attachmentTarget.id,
    };

    if (editingAttachment) {
      await updateFinancialTransactionAttachment.mutateAsync({
        id: editingAttachment.id,
        input: payload,
      });

      if (payload.file) {
        await replaceFinancialTransactionAttachmentFile.mutateAsync({
          id: editingAttachment.id,
          financialTransactionId: attachmentTarget.id,
          file: payload.file,
        });
      }
    } else {
      await createFinancialTransactionAttachment.mutateAsync(payload);
    }

    setAttachmentTarget(undefined);
    setEditingAttachment(undefined);
  };

  const toggleExpanded = (id: number) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Lancamento"
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
              <TableCell />
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
              const transactionItems = financialTransactionItems.filter(
                (item) =>
                  item.financialTransactionId === financialTransaction.id,
              );
              const transactionFulfillments =
                financialTransactionFulfillments.filter(
                  (item) =>
                    item.financialTransactionId === financialTransaction.id,
                );
              const transactionAttachments =
                financialTransactionAttachments.filter(
                  (item) =>
                    item.financialTransactionId === financialTransaction.id,
                );
              const counterpartyLabel = selectCounterpartyLabelById(
                masterCatalog,
                financialTransaction.counterpartyId,
              );
              const isExpanded = expandedIds.has(financialTransaction.id);
              const isCanceled = financialTransaction.status === 'CANCELED';
              const isOverdue =
                financialTransaction.dueDate &&
                new Date(financialTransaction.dueDate) < today &&
                financialTransaction.status !== 'PAID' &&
                !isCanceled;
              const isPending =
                financialTransaction.status === 'PENDING' ||
                financialTransaction.status === 'PARTIAL';

              return (
                <Fragment key={financialTransaction.id}>
                  <TableRow>
                    <TableCell width={42}>
                      <IconButton
                        size="small"
                        onClick={() => toggleExpanded(financialTransaction.id)}
                      >
                        {isExpanded ? (
                          <KeyboardArrowDownIcon />
                        ) : (
                          <KeyboardArrowRightIcon />
                        )}
                      </IconButton>
                    </TableCell>
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
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Pago {fmtBRL(financialTransaction.paidAmount ?? 0)}
                      </Typography>
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
                      <Typography variant="caption" color="text.secondary">
                        Falta {fmtBRL(financialTransaction.remainingAmount ?? 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <RowActions
                        disabled={isCanceled}
                        deleteConfirmMessage="Cancelar esta transacao?"
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
                          isPending && !isCanceled ? (
                            <Tooltip title="Registrar Pagamento">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setFulfillTarget(financialTransaction);
                                  setEditingFulfillment(undefined);
                                }}
                              >
                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={10} sx={{ p: 0, border: 0 }}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Stack spacing={2} sx={{ p: 2, bgcolor: '#F8FAF7' }}>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={`${transactionItems.length} items`}
                            />
                            <Chip
                              size="small"
                              label={`${transactionFulfillments.length} pagamentos`}
                            />
                            <Chip
                              size="small"
                              label={`${transactionAttachments.length} anexos`}
                            />
                            {!isCanceled && (
                              <>
                                <Button
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => {
                                    setItemTarget(financialTransaction);
                                    setEditingItem(undefined);
                                  }}
                                >
                                  Novo item
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => {
                                    setFulfillTarget(financialTransaction);
                                    setEditingFulfillment(undefined);
                                  }}
                                >
                                  Pagamento
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<AddIcon />}
                                  onClick={() => {
                                    setAttachmentTarget(financialTransaction);
                                    setEditingAttachment(undefined);
                                  }}
                                >
                                  Anexo
                                </Button>
                              </>
                            )}
                          </Stack>

                          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                            <Card variant="outlined" sx={{ flex: 1 }}>
                              <Box sx={{ p: 1.5, pb: 0 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Items
                                </Typography>
                              </Box>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Conta</TableCell>
                                    <TableCell>Centro</TableCell>
                                    <TableCell>Produto</TableCell>
                                    <TableCell align="right">Qtd</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell align="center">Acoes</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {transactionItems.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        {selectChartOfAccountLabelById(
                                          accountingCatalog,
                                          item.chartOfAccountId,
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {selectCostCenterLabelById(
                                          accountingCatalog,
                                          item.costCenterId,
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {getProductName(
                                          productsCatalog,
                                          item.productId,
                                        )}
                                      </TableCell>
                                      <TableCell align="right">
                                        {item.quantity?.toLocaleString('pt-BR') ??
                                          '-'}
                                      </TableCell>
                                      <TableCell align="right">
                                        {fmtBRL(item.amount ?? 0)}
                                      </TableCell>
                                      <TableCell align="center">
                                        <RowActions
                                          disabled={isCanceled}
                                          onEdit={() => {
                                            setItemTarget(financialTransaction);
                                            setEditingItem(item);
                                          }}
                                          onDelete={() => {
                                            void deleteFinancialTransactionItem.mutateAsync(
                                              {
                                                financialTransactionId:
                                                  financialTransaction.id,
                                                id: item.id,
                                              },
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {transactionItems.length === 0 && (
                                    <EmptyTableRow
                                      colSpan={6}
                                      message="Nenhum item."
                                    />
                                  )}
                                </TableBody>
                              </Table>
                            </Card>

                            <Card variant="outlined" sx={{ flex: 1 }}>
                              <Box sx={{ p: 1.5, pb: 0 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Pagamentos
                                </Typography>
                              </Box>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Conta</TableCell>
                                    <TableCell>Data</TableCell>
                                    <TableCell align="right">Valor</TableCell>
                                    <TableCell>Itens pagos</TableCell>
                                    <TableCell align="center">Acoes</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {transactionFulfillments.map((fulfillment) => (
                                    <TableRow key={fulfillment.id}>
                                      <TableCell>
                                        {selectBankAccountLabelById(
                                          bankCatalog,
                                          fulfillment.bankAccountId,
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {fmtDate(fulfillment.paymentDate)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {fmtBRL(fulfillment.amountPaid)}
                                      </TableCell>
                                      <TableCell>
                                        {fulfillment.allocations.length > 0 ? (
                                          <Stack spacing={0.25}>
                                            {fulfillment.allocations.map(
                                              (allocation, index) => {
                                                const item = transactionItems.find(
                                                  (candidate) =>
                                                    candidate.id ===
                                                    allocation.itemId,
                                                );
                                                const label = item?.productId
                                                  ? getProductName(
                                                      productsCatalog,
                                                      item.productId,
                                                    )
                                                  : item
                                                    ? selectChartOfAccountLabelById(
                                                        accountingCatalog,
                                                        item.chartOfAccountId,
                                                      )
                                                    : `Item ${
                                                        allocation.itemId ??
                                                        allocation.itemIndex ??
                                                        index + 1
                                                      }`;

                                                return (
                                                  <Typography
                                                    key={`${fulfillment.id}-${index}`}
                                                    variant="caption"
                                                    display="block"
                                                    color="text.secondary"
                                                  >
                                                    {label}: {fmtBRL(allocation.amount)}
                                                  </Typography>
                                                );
                                              },
                                            )}
                                          </Stack>
                                        ) : (
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            -
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell align="center">
                                        <RowActions
                                          disabled={isCanceled}
                                          onEdit={() => {
                                            setFulfillTarget(
                                              financialTransaction,
                                            );
                                            setEditingFulfillment(fulfillment);
                                          }}
                                          onDelete={() => {
                                            void deleteFinancialTransactionFulfillment.mutateAsync(
                                              {
                                                financialTransactionId:
                                                  financialTransaction.id,
                                                id: fulfillment.id,
                                              },
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {transactionFulfillments.length === 0 && (
                                    <EmptyTableRow
                                      colSpan={5}
                                      message="Nenhum pagamento."
                                    />
                                  )}
                                </TableBody>
                              </Table>
                            </Card>

                            <Card variant="outlined" sx={{ flex: 1 }}>
                              <Box sx={{ p: 1.5, pb: 0 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Anexos
                                </Typography>
                              </Box>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Arquivo</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Storage</TableCell>
                                    <TableCell align="center">Acoes</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {transactionAttachments.map((attachment) => (
                                    <TableRow key={attachment.id}>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {attachment.fileName}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {attachment.sizeBytes
                                            ? `${attachment.sizeBytes} bytes`
                                            : '-'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        {selectDocumentTypeLabelById(
                                          masterCatalog,
                                          attachment.documentTypeId,
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {attachment.storageProvider}
                                      </TableCell>
                                      <TableCell align="center">
                                        <RowActions
                                          disabled={isCanceled}
                                          onEdit={() => {
                                            setAttachmentTarget(
                                              financialTransaction,
                                            );
                                            setEditingAttachment(attachment);
                                          }}
                                          onDelete={() => {
                                            void deleteFinancialTransactionAttachment.mutateAsync(
                                              {
                                                financialTransactionId:
                                                  financialTransaction.id,
                                                id: attachment.id,
                                              },
                                            );
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                  {transactionAttachments.length === 0 && (
                                    <EmptyTableRow
                                      colSpan={4}
                                      message="Nenhum anexo."
                                    />
                                  )}
                                </TableBody>
                              </Table>
                            </Card>
                          </Stack>
                        </Stack>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
            {filtered.length === 0 && (
              <EmptyTableRow
                colSpan={10}
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
        chartOfAccounts={postableChartOfAccounts}
        costCenters={postableCostCenters}
        products={products}
        activeBankAccounts={activeBankAccounts}
        documentTypes={documentTypes}
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
        onClose={() => {
          setFulfillTarget(undefined);
          setEditingFulfillment(undefined);
        }}
        transaction={fulfillTarget}
        fulfillment={editingFulfillment}
        activeBankAccounts={activeBankAccounts}
        saving={
          createFinancialTransactionFulfillment.isPending ||
          updateFinancialTransactionFulfillment.isPending
        }
        onSave={(bankId, date, amount, observation) => {
          void handleFulfill(bankId, date, amount, observation);
        }}
      />
      <TransactionItemDialog
        open={!!itemTarget}
        onClose={() => {
          setItemTarget(undefined);
          setEditingItem(undefined);
        }}
        financialTransactionId={itemTarget?.id}
        editing={editingItem}
        chartOfAccounts={postableChartOfAccounts}
        costCenters={postableCostCenters}
        products={products}
        saving={
          createFinancialTransactionItem.isPending ||
          updateFinancialTransactionItem.isPending
        }
        onSave={(input) => {
          void handleSaveItem(input);
        }}
      />
      <TransactionAttachmentDialog
        open={!!attachmentTarget}
        onClose={() => {
          setAttachmentTarget(undefined);
          setEditingAttachment(undefined);
        }}
        financialTransactionId={attachmentTarget?.id}
        editing={editingAttachment}
        documentTypes={documentTypes}
        saving={
          createFinancialTransactionAttachment.isPending ||
          updateFinancialTransactionAttachment.isPending ||
          replaceFinancialTransactionAttachmentFile.isPending
        }
        onSave={(input) => {
          void handleSaveAttachment(input);
        }}
      />
    </Box>
  );
}
