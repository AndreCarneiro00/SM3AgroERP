import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../forms/FormTextField';
import { todayIsoDate, toInputValue } from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  ChartOfAccount,
  CostCenter,
} from '../../../domains/accounting/model/entities';
import type { BankAccount } from '../../../domains/banking/model/entities';
import type {
  AttachmentStorageProvider,
  FinancialTransactionType,
} from '../../../domains/financial/api/dtos';
import type { FinancialTransaction } from '../../../domains/financial/model/entities';
import type { InventoryBatch } from '../../../domains/inventory/model/entities';
import type { Counterparty, DocumentType } from '../../../domains/master-data/model/entities';
import type { Product } from '../../../domains/products/model/entities';
import {
  calculateFinancialItemAmount,
  resolveFinancialItemAmount,
} from './itemAmount';

export interface TransactionItemFormData {
  chartOfAccountId?: number;
  costCenterId?: number;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  productId?: number;
  inventoryBatchId?: number;
  inventoryUnitCost?: number;
}

export interface TransactionFulfillmentFormData {
  bankAccountId?: number;
  paymentDate: string;
  amountPaid?: number;
  allocations?: TransactionFulfillmentAllocationFormData[];
  observation?: string;
}

export interface TransactionFulfillmentAllocationFormData {
  itemIndex?: number;
  itemId?: number;
  amount: number;
}

export interface TransactionAttachmentFormData {
  documentTypeId?: number;
  storageProvider: AttachmentStorageProvider;
  observation?: string;
  file?: File;
}

export interface TransactionFormData {
  description: string;
  counterpartyId?: number;
  issueDate: string;
  dueDate?: string;
  documentNumber?: string;
  type: FinancialTransactionType;
  observation?: string;
  hasNf: boolean;
  items: TransactionItemFormData[];
  fulfillments: TransactionFulfillmentFormData[];
  attachments: TransactionAttachmentFormData[];
}

const transactionTypeValues = ['INCOME', 'EXPENSE'] as const;
const yesNoValues = ['yes', 'no'] as const;
const paymentModeValues = ['unpaid', 'paid', 'partial'] as const;

type PaymentMode = (typeof paymentModeValues)[number];

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descricao.'),
  counterpartyId: z.string(),
  issueDate: z.string().min(1, 'Informe a data de emissao.'),
  dueDate: z.string(),
  documentNumber: z.string(),
  type: z.enum(transactionTypeValues),
  observation: z.string(),
  hasNf: z.enum(yesNoValues),
});

type TransactionDialogValues = z.infer<typeof transactionSchema>;

function getDefaultValues(
  editing?: FinancialTransaction,
): TransactionDialogValues {
  return {
    description: editing?.description ?? '',
    counterpartyId: toInputValue(editing?.counterpartyId),
    issueDate: editing?.issueDate ?? todayIsoDate(),
    dueDate: editing?.dueDate ?? '',
    documentNumber: editing?.documentNumber ?? '',
    type: editing?.type ?? 'EXPENSE',
    observation: editing?.observation ?? '',
    hasNf: editing?.hasNf ? 'yes' : 'no',
  };
}

function emptyItem(): TransactionItemFormData {
  return {};
}

function emptyFulfillment(): TransactionFulfillmentFormData {
  return {
    paymentDate: todayIsoDate(),
  };
}

function emptyAttachment(): TransactionAttachmentFormData {
  return {
    storageProvider: 'LOCAL',
  };
}

function parseOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getProduct(products: Product[], productId?: number) {
  return products.find((product) => product.id === productId);
}

function stockApplies(product: Product | undefined, issueDate: string) {
  if (!product || product.hasStock !== true) {
    return false;
  }

  return !product.stockControlStartDate || issueDate >= product.stockControlStartDate;
}

type SellableBatchOption = InventoryBatch & {
  availableQuantity: number;
};

interface BatchUsageSummary {
  productId: number;
  productName: string;
  soldQuantity: number;
  totalQuantity: number;
}

function getSellableBatches(
  inventoryBatches: InventoryBatch[],
  productId?: number,
) {
  if (!productId) {
    return [];
  }

  return inventoryBatches
    .filter(
      (batch) =>
        batch.productId === productId &&
        batch.status === 'ACTIVE' &&
        (batch.quantity ?? 0) > 0,
    )
    .sort((left, right) => {
      const dateOrder = (left.batchDate ?? '').localeCompare(
        right.batchDate ?? '',
      );
      return dateOrder !== 0 ? dateOrder : left.id - right.id;
    });
}

function getReservedQuantityForBatch(params: {
  items: TransactionItemFormData[];
  itemIndex: number;
  transactionType: FinancialTransactionType;
  issueDate: string;
  products: Product[];
  batchId: number;
  batchProductId?: number;
}) {
  if (params.transactionType !== 'INCOME') {
    return 0;
  }

  return params.items.reduce((sum, item, index) => {
    if (
      index === params.itemIndex ||
      item.inventoryBatchId !== params.batchId ||
      item.productId !== params.batchProductId ||
      !item.quantity ||
      item.quantity <= 0
    ) {
      return sum;
    }

    const product = getProduct(params.products, item.productId);

    if (!stockApplies(product, params.issueDate)) {
      return sum;
    }

    return sum + item.quantity;
  }, 0);
}

function getAvailableQuantityForBatch(
  batch: InventoryBatch,
  params: {
    items: TransactionItemFormData[];
    itemIndex: number;
    transactionType: FinancialTransactionType;
    issueDate: string;
    products: Product[];
  },
) {
  const reservedQuantity = getReservedQuantityForBatch({
    ...params,
    batchId: batch.id,
    batchProductId: batch.productId,
  });

  return Math.max(0, (batch.quantity ?? 0) - reservedQuantity);
}

function getSellableBatchOptions(params: {
  inventoryBatches: InventoryBatch[];
  productId?: number;
  selectedInventoryBatchId?: number;
  items: TransactionItemFormData[];
  itemIndex: number;
  transactionType: FinancialTransactionType;
  issueDate: string;
  products: Product[];
}): SellableBatchOption[] {
  return getSellableBatches(params.inventoryBatches, params.productId)
    .map((batch) => ({
      ...batch,
      availableQuantity: getAvailableQuantityForBatch(batch, params),
    }))
    .filter(
      (batch) =>
        batch.availableQuantity > 0 ||
        batch.id === params.selectedInventoryBatchId,
    );
}

function getTotalAvailableQuantity(sellableBatches: SellableBatchOption[]) {
  return sellableBatches.reduce(
    (sum, batch) => sum + batch.availableQuantity,
    0,
  );
}

function getBatchUsageSummaries(params: {
  items: TransactionItemFormData[];
  transactionType: FinancialTransactionType;
  issueDate: string;
  products: Product[];
  inventoryBatches: InventoryBatch[];
}): BatchUsageSummary[] {
  if (params.transactionType !== 'INCOME') {
    return [];
  }

  const batchesById = new Map(
    params.inventoryBatches.map((batch) => [batch.id, batch]),
  );
  const summariesByProductId = new Map<
    number,
    {
      productName: string;
      soldQuantity: number;
      batchIds: Set<number>;
    }
  >();

  params.items.forEach((item) => {
    if (
      !item.productId ||
      !item.inventoryBatchId ||
      !item.quantity ||
      item.quantity <= 0
    ) {
      return;
    }

    const product = getProduct(params.products, item.productId);
    const batch = batchesById.get(item.inventoryBatchId);

    if (
      !product ||
      !stockApplies(product, params.issueDate) ||
      !batch ||
      batch.productId !== item.productId
    ) {
      return;
    }

    const summary = summariesByProductId.get(item.productId) ?? {
      productName: product.name,
      soldQuantity: 0,
      batchIds: new Set<number>(),
    };
    summary.soldQuantity += item.quantity;
    summary.batchIds.add(batch.id);
    summariesByProductId.set(item.productId, summary);
  });

  return [...summariesByProductId.entries()].map(([productId, summary]) => ({
    productId,
    productName: summary.productName,
    soldQuantity: summary.soldQuantity,
    totalQuantity: [...summary.batchIds].reduce(
      (sum, batchId) => sum + (batchesById.get(batchId)?.quantity ?? 0),
      0,
    ),
  }));
}

function getItemStockError(params: {
  item: TransactionItemFormData;
  items: TransactionItemFormData[];
  itemIndex: number;
  transactionType: FinancialTransactionType;
  issueDate: string;
  products: Product[];
  inventoryBatches: InventoryBatch[];
}) {
  const product = getProduct(params.products, params.item.productId);

  if (!product) {
    return undefined;
  }

  if (!params.item.quantity || params.item.quantity <= 0) {
    return 'Produto exige quantidade maior que zero.';
  }

  if (product.hasStock === null || product.hasStock === undefined) {
    return 'Classifique o produto no cadastro antes de usar em lancamentos.';
  }

  if (!stockApplies(product, params.issueDate)) {
    return undefined;
  }

  if (params.transactionType === 'EXPENSE') {
    return params.item.unitPrice === undefined ||
      params.item.unitPrice < 0
      ? 'Compra com estoque exige preco unitario.'
      : undefined;
  }

  if (!params.item.inventoryBatchId) {
    return 'Venda com estoque exige lote.';
  }

  const batch = params.inventoryBatches.find(
    (candidate) => candidate.id === params.item.inventoryBatchId,
  );

  if (!batch) {
    return 'Lote de estoque nao encontrado.';
  }

  if (batch.productId !== params.item.productId) {
    return 'Lote selecionado pertence a outro produto.';
  }

  if (batch.status !== 'ACTIVE' || (batch.quantity ?? 0) <= 0) {
    return 'Lote selecionado nao esta disponivel para venda.';
  }

  const availableQuantity = getAvailableQuantityForBatch(batch, {
    items: params.items,
    itemIndex: params.itemIndex,
    transactionType: params.transactionType,
    issueDate: params.issueDate,
    products: params.products,
  });

  if (params.item.quantity - availableQuantity > 0.000001) {
    return 'Quantidade vendida excede o saldo disponivel do lote.';
  }

  return undefined;
}

function allocateFulfillmentsByItemIndex(
  items: TransactionItemFormData[],
  paymentAmounts: number[],
) {
  const remainingByItem = items.map((item) => roundCurrency(item.amount ?? 0));

  return paymentAmounts.map((paymentAmount) => {
    let remainingPayment = roundCurrency(paymentAmount);
    const allocations: TransactionFulfillmentAllocationFormData[] = [];

    remainingByItem.forEach((availableAmount, itemIndex) => {
      if (remainingPayment <= 0 || availableAmount <= 0) {
        return;
      }

      const allocatedAmount = roundCurrency(
        Math.min(availableAmount, remainingPayment),
      );

      if (allocatedAmount <= 0) {
        return;
      }

      allocations.push({
        itemIndex,
        amount: allocatedAmount,
      });
      remainingByItem[itemIndex] = roundCurrency(
        availableAmount - allocatedAmount,
      );
      remainingPayment = roundCurrency(remainingPayment - allocatedAmount);
    });

    if (remainingPayment > 0.009) {
      return undefined;
    }

    return allocations;
  });
}

function getEntityLabel(entity: { code?: string; name: string }) {
  return entity.code ? `${entity.code} - ${entity.name}` : entity.name;
}

function fmtQuantity(value: number) {
  return value.toLocaleString('pt-BR');
}

function mergeItemWithResolvedAmount(
  item: TransactionItemFormData,
  patch: Partial<TransactionItemFormData>,
): TransactionItemFormData {
  const nextItem = { ...item, ...patch };
  const shouldRecalculate =
    Object.prototype.hasOwnProperty.call(patch, 'quantity') ||
    Object.prototype.hasOwnProperty.call(patch, 'unitPrice');

  if (!shouldRecalculate) {
    return nextItem;
  }

  return {
    ...nextItem,
    amount: calculateFinancialItemAmount(nextItem.quantity, nextItem.unitPrice),
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: FinancialTransaction;
  counterparties: Counterparty[];
  chartOfAccounts: ChartOfAccount[];
  costCenters: CostCenter[];
  products: Product[];
  inventoryBatches: InventoryBatch[];
  activeBankAccounts: BankAccount[];
  documentTypes: DocumentType[];
  onSave: (data: TransactionFormData) => void | Promise<void>;
  saving?: boolean;
}

export function TransactionDialog({
  open,
  onClose,
  editing,
  counterparties,
  chartOfAccounts,
  costCenters,
  products,
  inventoryBatches,
  activeBankAccounts,
  documentTypes,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset, watch } =
    useForm<TransactionDialogValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(transactionSchema),
    });
  const [items, setItems] = useState<TransactionItemFormData[]>([emptyItem()]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('unpaid');
  const [fulfillments, setFulfillments] = useState<
    TransactionFulfillmentFormData[]
  >([emptyFulfillment()]);
  const [attachments, setAttachments] = useState<TransactionAttachmentFormData[]>(
    [],
  );

  useEffect(() => {
    reset(getDefaultValues(editing));
    setItems([emptyItem()]);
    setPaymentMode('unpaid');
    setFulfillments([emptyFulfillment()]);
    setAttachments([]);
  }, [editing, open, reset]);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + (resolveFinancialItemAmount(item) ?? 0), 0),
    [items],
  );
  const transactionType = watch('type');
  const issueDate = watch('issueDate');
  const partialPaidAmount = useMemo(
    () =>
      fulfillments.reduce(
        (sum, fulfillment) => sum + (fulfillment.amountPaid ?? 0),
        0,
      ),
    [fulfillments],
  );
  const itemStockErrors = useMemo(
    () =>
      items.map((item, index) =>
        getItemStockError({
          item,
          items,
          itemIndex: index,
          transactionType,
          issueDate,
          products,
          inventoryBatches,
        }),
      ),
    [inventoryBatches, issueDate, items, products, transactionType],
  );
  const batchUsageSummaries = useMemo(
    () =>
      getBatchUsageSummaries({
        items,
        transactionType,
        issueDate,
        products,
        inventoryBatches,
      }),
    [inventoryBatches, issueDate, items, products, transactionType],
  );
  const hasValidItem = items.some(
    (item, index) => {
      const amount = resolveFinancialItemAmount(item);
      return !!item.chartOfAccountId && !!amount && amount > 0 && !itemStockErrors[index];
    },
  );
  const stockItemsAreValid = itemStockErrors.every((error, index) => {
    const item = items[index];
    const amount = resolveFinancialItemAmount(item);
    return !item.chartOfAccountId || !amount || amount <= 0 || !error;
  });
  const paymentIsValid =
    editing ||
    paymentMode === 'unpaid' ||
    (paymentMode === 'paid' &&
      totalAmount > 0 &&
      !!fulfillments[0]?.bankAccountId &&
      !!fulfillments[0]?.paymentDate) ||
    (paymentMode === 'partial' &&
      fulfillments.length > 0 &&
      fulfillments.every(
        (fulfillment) =>
          fulfillment.bankAccountId &&
          fulfillment.paymentDate &&
          fulfillment.amountPaid &&
          fulfillment.amountPaid > 0,
      ) &&
      partialPaidAmount <= totalAmount);
  const attachmentsAreValid =
    editing ||
    attachments.every(
      (attachment) => attachment.documentTypeId && attachment.file,
    );
  const busy = saving || formState.isSubmitting;
  const saveDisabled =
    busy ||
    (!editing &&
      (!hasValidItem ||
        !stockItemsAreValid ||
        !paymentIsValid ||
        !attachmentsAreValid));

  const updateItem = (index: number, patch: Partial<TransactionItemFormData>) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? mergeItemWithResolvedAmount(item, patch) : item,
      ),
    );
  };

  const splitSaleItemByFifo = (index: number) => {
    const currentItem = items[index];
    const selectedProduct = getProduct(products, currentItem.productId);

    if (items.length !== 1) {
      window.alert(
        'A divisao por FIFO so pode ser feita quando ha um unico item.',
      );
      return;
    }

    if (
      transactionType !== 'INCOME' ||
      !stockApplies(selectedProduct, issueDate) ||
      !currentItem.quantity ||
      currentItem.quantity <= 0
    ) {
      return;
    }

    const sellableBatches = getSellableBatchOptions({
      inventoryBatches,
      productId: currentItem.productId,
      selectedInventoryBatchId: currentItem.inventoryBatchId,
      items,
      itemIndex: index,
      transactionType,
      issueDate,
      products,
    }).filter((batch) => batch.availableQuantity > 0);
    const totalSellableQuantity = getTotalAvailableQuantity(sellableBatches);

    if (
      sellableBatches.length < 2 ||
      currentItem.quantity > totalSellableQuantity
    ) {
      window.alert(
        'Nao foi possivel dividir por FIFO com os lotes disponiveis.',
      );
      return;
    }

    let remainingQuantity = currentItem.quantity;
    const splitItems: TransactionItemFormData[] = [];

    for (const batch of sellableBatches) {
      if (remainingQuantity <= 0) {
        break;
      }

      const availableQuantity = batch.availableQuantity;

      if (availableQuantity <= 0) {
        continue;
      }

      const splitQuantity = Math.min(availableQuantity, remainingQuantity);
      splitItems.push({
        ...currentItem,
        quantity: splitQuantity,
        inventoryBatchId: batch.id,
        amount: calculateFinancialItemAmount(splitQuantity, currentItem.unitPrice),
      });
      remainingQuantity -= splitQuantity;
    }

    if (remainingQuantity > 0) {
      window.alert(
        'Nao foi possivel dividir por FIFO com os lotes disponiveis.',
      );
      return;
    }

    setItems((current) => [
      ...current.filter((_, itemIndex) => itemIndex !== index),
      ...splitItems,
    ]);
  };

  const updateFulfillment = (
    index: number,
    patch: Partial<TransactionFulfillmentFormData>,
  ) => {
    setFulfillments((current) =>
      current.map((fulfillment, fulfillmentIndex) =>
        fulfillmentIndex === index
          ? { ...fulfillment, ...patch }
          : fulfillment,
      ),
    );
  };

  const updateAttachment = (
    index: number,
    patch: Partial<TransactionAttachmentFormData>,
  ) => {
    setAttachments((current) =>
      current.map((attachment, attachmentIndex) =>
        attachmentIndex === index ? { ...attachment, ...patch } : attachment,
      ),
    );
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const normalizedItems = items.flatMap((item) => {
      const amount = resolveFinancialItemAmount(item);
      const product = getProduct(products, item.productId);
      const shouldUseUnitPriceAsInventoryCost =
        values.type === 'EXPENSE' &&
        stockApplies(product, values.issueDate) &&
        item.unitPrice !== undefined;

      if (!item.chartOfAccountId || !amount || amount <= 0) {
        return [];
      }

      return [{
        chartOfAccountId: item.chartOfAccountId,
        costCenterId: item.costCenterId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount,
        productId: item.productId,
        inventoryBatchId: item.inventoryBatchId,
        inventoryUnitCost: shouldUseUnitPriceAsInventoryCost
          ? item.unitPrice
          : undefined,
      }];
    });
    const normalizedTotalAmount = normalizedItems.reduce(
      (sum, item) => sum + (item.amount ?? 0),
      0,
    );
    const fulfillmentDrafts =
      paymentMode === 'paid'
        ? [
            {
              bankAccountId: fulfillments[0]?.bankAccountId,
              paymentDate: fulfillments[0]?.paymentDate || todayIsoDate(),
              amountPaid: normalizedTotalAmount,
              observation: fulfillments[0]?.observation,
            },
          ]
        : paymentMode === 'partial'
          ? fulfillments
              .filter(
                (fulfillment) =>
                  fulfillment.bankAccountId && fulfillment.amountPaid,
              )
              .map((fulfillment) => ({
                bankAccountId: fulfillment.bankAccountId,
                paymentDate: fulfillment.paymentDate,
                amountPaid: fulfillment.amountPaid,
                observation: fulfillment.observation,
              }))
          : [];
    const allocationGroups = allocateFulfillmentsByItemIndex(
      normalizedItems,
      fulfillmentDrafts.map((fulfillment) => fulfillment.amountPaid ?? 0),
    );

    if (allocationGroups.some((allocations) => !allocations)) {
      window.alert('O valor pago nao pode exceder o total dos items.');
      return;
    }

    const normalizedFulfillments = fulfillmentDrafts.map(
      (fulfillment, index) => ({
        ...fulfillment,
        allocations: allocationGroups[index] ?? [],
      }),
    );
    const normalizedAttachments = attachments
      .filter((attachment) => attachment.documentTypeId && attachment.file)
      .map((attachment) => ({
        documentTypeId: attachment.documentTypeId,
        storageProvider: attachment.storageProvider,
        observation: attachment.observation,
        file: attachment.file,
      }));

    await onSave({
      description: values.description.trim(),
      counterpartyId: values.counterpartyId
        ? Number(values.counterpartyId)
        : undefined,
      issueDate: values.issueDate.trim(),
      dueDate: values.dueDate.trim() || undefined,
      documentNumber: values.documentNumber.trim() || undefined,
      type: values.type,
      observation: values.observation.trim() || undefined,
      hasNf: values.hasNf === 'yes',
      items: normalizedItems,
      fulfillments: normalizedFulfillments,
      attachments: normalizedAttachments,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editing ? 'Editar Transacao' : 'Novo Lancamento'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="description"
            label="Descricao"
            fullWidth
          />

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="type"
              label="Tipo"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="INCOME">Receita</MenuItem>
              <MenuItem value="EXPENSE">Despesa</MenuItem>
            </FormTextField>
            <FormTextField
              control={control}
              name="counterpartyId"
              label="Contraparte"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="">- Nenhuma -</MenuItem>
              {counterparties.map((counterparty) => (
                <MenuItem key={counterparty.id} value={String(counterparty.id)}>
                  {counterparty.tradeName ?? counterparty.legalName}
                </MenuItem>
              ))}
            </FormTextField>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="issueDate"
              label="Emissao"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <FormTextField
              control={control}
              name="dueDate"
              label="Vencimento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="documentNumber"
              label="Numero Documento"
              fullWidth
            />
            <FormTextField
              control={control}
              name="hasNf"
              label="Possui NF?"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="yes">Sim</MenuItem>
              <MenuItem value="no">Nao</MenuItem>
            </FormTextField>
          </Stack>

          <FormTextField
            control={control}
            name="observation"
            label="Observacao"
            fullWidth
            multiline
            rows={2}
          />

          {editing ? (
            <Typography variant="body2" color="text.secondary">
              Items, pagamentos e anexos sao editados na expansao da transacao.
            </Typography>
          ) : (
            <>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Items do lancamento
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    O valor total sera derivado destes items.
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setItems((current) => [...current, emptyItem()])}
                >
                  Item
                </Button>
              </Stack>

              {items.map((item, index) => {
                const selectedProduct = getProduct(products, item.productId);
                const itemStockApplies = stockApplies(
                  selectedProduct,
                  issueDate,
                );
                const sellableBatches = getSellableBatchOptions({
                  inventoryBatches,
                  productId: item.productId,
                  selectedInventoryBatchId: item.inventoryBatchId,
                  items,
                  itemIndex: index,
                  transactionType,
                  issueDate,
                  products,
                });
                const batchesWithAvailableStock = sellableBatches.filter(
                  (batch) => batch.availableQuantity > 0,
                );
                const totalSellableQuantity = getTotalAvailableQuantity(
                  batchesWithAvailableStock,
                );
                const selectedBatchCanBeDisplayed = sellableBatches.some(
                  (batch) => batch.id === item.inventoryBatchId,
                );
                const batchSelectValue = selectedBatchCanBeDisplayed
                  ? String(item.inventoryBatchId ?? '')
                  : '';
                const firstAvailableBatchQuantity =
                  batchesWithAvailableStock[0]?.availableQuantity ?? 0;
                const selectedBatchQuantity =
                  sellableBatches.find(
                    (batch) => batch.id === item.inventoryBatchId,
                  )?.availableQuantity ?? firstAvailableBatchQuantity;
                const availableBatchCount = batchesWithAvailableStock.length;
                const needsFifoSplit =
                  items.length === 1 &&
                  itemStockApplies &&
                  transactionType === 'INCOME' &&
                  (item.quantity ?? 0) > selectedBatchQuantity &&
                  (item.quantity ?? 0) <= totalSellableQuantity &&
                  availableBatchCount > 1;
                const stockError = itemStockErrors[index];

                return (
                <Stack key={index} spacing={1} sx={{ p: 1.5, bgcolor: '#F7F8FA' }}>
                  <Stack direction="row" spacing={1.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Conta Contabil</InputLabel>
                      <Select
                        value={String(item.chartOfAccountId ?? '')}
                        label="Conta Contabil"
                        onChange={(event) =>
                          updateItem(index, {
                            chartOfAccountId: Number(event.target.value),
                          })
                        }
                      >
                        {chartOfAccounts.map((account) => (
                          <MenuItem key={account.id} value={String(account.id)}>
                            {getEntityLabel(account)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Centro de Custo</InputLabel>
                      <Select
                        value={String(item.costCenterId ?? '')}
                        label="Centro de Custo"
                        onChange={(event) =>
                          updateItem(index, {
                            costCenterId: event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          })
                        }
                      >
                        <MenuItem value="">- Nenhum -</MenuItem>
                        {costCenters.map((center) => (
                          <MenuItem key={center.id} value={String(center.id)}>
                            {getEntityLabel(center)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <IconButton
                      color="error"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1.5}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Produto</InputLabel>
                      <Select
                        value={String(item.productId ?? '')}
                        label="Produto"
                        onChange={(event) => {
                          const productId = event.target.value
                            ? Number(event.target.value)
                            : undefined;
                          const nextProduct = getProduct(products, productId);
                          const nextStockApplies = stockApplies(
                            nextProduct,
                            issueDate,
                          );
                          const nextSellableBatch = getSellableBatchOptions({
                            inventoryBatches,
                            productId,
                            items,
                            itemIndex: index,
                            transactionType,
                            issueDate,
                            products,
                          }).find((batch) => batch.availableQuantity > 0);

                          updateItem(index, {
                            productId,
                            inventoryBatchId:
                              transactionType === 'INCOME' && nextStockApplies
                                ? nextSellableBatch?.id
                                : undefined,
                            inventoryUnitCost: undefined,
                          });
                        }}
                      >
                        <MenuItem value="">- Nenhum -</MenuItem>
                        {products.map((product) => (
                          <MenuItem key={product.id} value={String(product.id)}>
                            {product.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Quantidade"
                      type="number"
                      size="small"
                      value={toInputValue(item.quantity)}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: parseOptionalNumber(event.target.value),
                        })
                      }
                      fullWidth
                    />
                    <TextField
                      label="Preco Unit."
                      type="number"
                      size="small"
                      value={toInputValue(item.unitPrice)}
                      onChange={(event) =>
                        updateItem(index, {
                          unitPrice: parseOptionalNumber(event.target.value),
                          inventoryUnitCost: undefined,
                        })
                      }
                      fullWidth
                    />
                    <TextField
                      label="Valor"
                      type="number"
                      size="small"
                      value={toInputValue(resolveFinancialItemAmount(item))}
                      InputProps={{ readOnly: true }}
                      fullWidth
                      required
                    />
                  </Stack>
                  {itemStockApplies && transactionType === 'INCOME' && (
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Lote de estoque</InputLabel>
                        <Select
                          value={batchSelectValue}
                          label="Lote de estoque"
                          onChange={(event) =>
                            updateItem(index, {
                              inventoryBatchId: event.target.value
                                ? Number(event.target.value)
                                : undefined,
                            })
                          }
                        >
                          <MenuItem value="">- Selecione -</MenuItem>
                          {sellableBatches.map((batch) => (
                            <MenuItem
                              key={batch.id}
                              value={String(batch.id)}
                              disabled={batch.availableQuantity <= 0}
                            >
                              {batch.code ?? `#${batch.id}`} - saldo{' '}
                              {batch.availableQuantity.toLocaleString('pt-BR')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {needsFifoSplit && (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="caption" color="text.secondary">
                            A quantidade informada consome mais de um lote.
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => splitSaleItemByFifo(index)}
                          >
                            Dividir por FIFO
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  )}
                  {stockError && (
                    <Typography variant="caption" color="error.main">
                      {stockError}
                    </Typography>
                  )}
                </Stack>
                );
              })}

              <Stack spacing={0.5} alignItems="flex-end">
                {batchUsageSummaries.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    justifyContent="flex-end"
                  >
                    {batchUsageSummaries.map((summary) => (
                      <Typography
                        key={summary.productId}
                        variant="caption"
                        color="text.secondary"
                      >
                        {summary.productName}:{' '}
                        {fmtQuantity(summary.soldQuantity)}/
                        {fmtQuantity(summary.totalQuantity)}
                      </Typography>
                    ))}
                  </Stack>
                )}
                <Typography variant="body2" fontWeight={700} align="right">
                  Total dos items:{' '}
                  {totalAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Typography>
              </Stack>

              <Divider />
              <FormControl fullWidth size="small">
                <InputLabel>Situacao do pagamento</InputLabel>
                <Select
                  value={paymentMode}
                  label="Situacao do pagamento"
                  onChange={(event) => {
                    const mode = event.target.value as PaymentMode;
                    setPaymentMode(mode);
                    setFulfillments([emptyFulfillment()]);
                  }}
                >
                  <MenuItem value="unpaid">Ainda nao pago</MenuItem>
                  <MenuItem value="paid">Ja quitado</MenuItem>
                  <MenuItem value="partial">Pago parcialmente</MenuItem>
                </Select>
              </FormControl>

              {paymentMode !== 'unpaid' && (
                <Stack spacing={1}>
                  {paymentMode === 'partial' && (
                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Pagamentos ja realizados
                        </Typography>
                        <Typography
                          variant="caption"
                          color={
                            partialPaidAmount > totalAmount
                              ? 'error.main'
                              : 'text.secondary'
                          }
                        >
                          Total pago informado: {partialPaidAmount.toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            },
                          )}
                        </Typography>
                      </Box>
                      <Button
                        startIcon={<AddIcon />}
                        size="small"
                        onClick={() =>
                          setFulfillments((current) => [
                            ...current,
                            emptyFulfillment(),
                          ])
                        }
                      >
                        Pagamento
                      </Button>
                    </Stack>
                  )}
                  {fulfillments.map((fulfillment, index) => (
                    <Stack key={index} direction="row" spacing={1.5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Conta Bancaria</InputLabel>
                        <Select
                          value={String(fulfillment.bankAccountId ?? '')}
                          label="Conta Bancaria"
                          onChange={(event) =>
                            updateFulfillment(index, {
                              bankAccountId: Number(event.target.value),
                            })
                          }
                        >
                          {activeBankAccounts.map((bankAccount) => (
                            <MenuItem
                              key={bankAccount.id}
                              value={String(bankAccount.id)}
                            >
                              {bankAccount.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        label="Data"
                        type="date"
                        size="small"
                        value={fulfillment.paymentDate}
                        onChange={(event) =>
                          updateFulfillment(index, {
                            paymentDate: event.target.value,
                          })
                        }
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                      {paymentMode === 'partial' && (
                        <TextField
                          label="Valor Pago"
                          type="number"
                          size="small"
                          value={toInputValue(fulfillment.amountPaid)}
                          onChange={(event) =>
                            updateFulfillment(index, {
                              amountPaid: parseOptionalNumber(event.target.value),
                            })
                          }
                          fullWidth
                        />
                      )}
                      <TextField
                        label="Observacao"
                        size="small"
                        value={fulfillment.observation ?? ''}
                        onChange={(event) =>
                          updateFulfillment(index, {
                            observation: event.target.value || undefined,
                          })
                        }
                        fullWidth
                      />
                      {paymentMode === 'partial' && (
                        <IconButton
                          color="error"
                          disabled={fulfillments.length === 1}
                          onClick={() =>
                            setFulfillments((current) =>
                              current.filter(
                                (_, fulfillmentIndex) =>
                                  fulfillmentIndex !== index,
                              ),
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}

              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Anexos opcionais
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    LOCAL funciona agora; S3 fica disponivel como opcao futura.
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() =>
                    setAttachments((current) => [...current, emptyAttachment()])
                  }
                >
                  Anexo
                </Button>
              </Stack>

              {attachments.map((attachment, index) => (
                <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo Documento</InputLabel>
                    <Select
                      value={String(attachment.documentTypeId ?? '')}
                      label="Tipo Documento"
                      onChange={(event) =>
                        updateAttachment(index, {
                          documentTypeId: Number(event.target.value),
                        })
                      }
                    >
                      {documentTypes.map((documentType) => (
                        <MenuItem
                          key={documentType.id}
                          value={String(documentType.id)}
                        >
                          {documentType.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Storage</InputLabel>
                    <Select
                      value={attachment.storageProvider}
                      label="Storage"
                      onChange={(event) =>
                        updateAttachment(index, {
                          storageProvider:
                            event.target.value as AttachmentStorageProvider,
                        })
                      }
                    >
                      <MenuItem value="LOCAL">LOCAL</MenuItem>
                      <MenuItem value="ONEDRIVE">ONEDRIVE</MenuItem>
                      <MenuItem value="S3">S3</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Observacao"
                    size="small"
                    value={attachment.observation ?? ''}
                    onChange={(event) =>
                      updateAttachment(index, {
                        observation: event.target.value || undefined,
                      })
                    }
                    fullWidth
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {attachment.file?.name ?? 'Arquivo'}
                    <input
                      hidden
                      type="file"
                      onChange={(event) =>
                        updateAttachment(index, {
                          file: event.target.files?.[0],
                        })
                      }
                    />
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter(
                          (_, attachmentIndex) => attachmentIndex !== index,
                        ),
                      )
                    }
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={saveDisabled}
          onClick={() => {
            void handleFormSubmit();
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
