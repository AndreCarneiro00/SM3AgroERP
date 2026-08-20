import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../forms/FormTextField';
import { todayIsoDate, toInputValue } from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type { BankAccount } from '../../../domains/banking/model/entities';
import type {
  FinancialTransaction,
  FinancialTransactionFulfillment,
  FinancialTransactionFulfillmentAllocationInput,
  FinancialTransactionItem,
} from '../../../domains/financial/model/entities';
import { FulfillmentAllocationEditor } from './FulfillmentAllocationEditor';
import {
  buildSuggestedAllocations,
  roundCurrency,
  validateAllocationRows,
  type AllocationEditorRow,
  type AllocationKey,
} from './fulfillmentAllocation';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function getMaximumPayableAmount(
  transaction?: FinancialTransaction,
  fulfillment?: FinancialTransactionFulfillment,
) {
  if (!transaction) {
    return Number.POSITIVE_INFINITY;
  }

  const availableAmount =
    transaction.remainingAmount ?? transaction.totalAmount ?? 0;
  const currentFulfillmentAmount = fulfillment?.amountPaid ?? 0;

  return roundCurrency(availableAmount + currentFulfillmentAmount);
}

function createFulfillmentSchema(maximumPayableAmount: number) {
  return z.object({
    bankId: z.string().min(1, 'Selecione a conta bancaria.'),
    date: z.string().min(1, 'Informe a data do pagamento.'),
    amount: z
      .string()
      .trim()
      .min(1, 'Informe o valor pago.')
      .refine(
        (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
        'Informe um valor pago valido.',
      )
      .refine(
        (value) =>
          Number.isFinite(maximumPayableAmount)
            ? Number(value) <= maximumPayableAmount
            : true,
        `O valor pago nao pode exceder ${fmtBRL(maximumPayableAmount)}.`,
      ),
    observation: z.string(),
  });
}

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction;
  fulfillment?: FinancialTransactionFulfillment;
  transactionItems: FinancialTransactionItem[];
  transactionFulfillments: FinancialTransactionFulfillment[];
  activeBankAccounts: BankAccount[];
  getItemLabel: (item: FinancialTransactionItem) => string;
  onSave: (
    bankId: number,
    date: string,
    amount: number,
    allocations: FinancialTransactionFulfillmentAllocationInput[],
    observation: string,
  ) => void | Promise<void>;
  saving?: boolean;
}

type FulfillmentFormValues = z.infer<ReturnType<typeof createFulfillmentSchema>>;

interface FulfillmentAllocationFormData {
  itemId: number;
  amount?: number;
}

function getDefaultValues(
  transaction?: FinancialTransaction,
  fulfillment?: FinancialTransactionFulfillment,
): FulfillmentFormValues {
  return {
    bankId: toInputValue(fulfillment?.bankAccountId),
    date: fulfillment?.paymentDate ?? todayIsoDate(),
    amount: toInputValue(
      fulfillment?.amountPaid ??
        transaction?.remainingAmount ??
        transaction?.totalAmount,
    ),
    observation: fulfillment?.observation ?? '',
  };
}

function getInitialAllocations(
  fulfillment?: FinancialTransactionFulfillment,
): FulfillmentAllocationFormData[] {
  return (fulfillment?.allocations ?? []).flatMap((allocation) => {
    if (!allocation.itemId) {
      return [];
    }

    return [{
      itemId: allocation.itemId,
      amount: allocation.amount,
    }];
  });
}

function getAllocatedAmountForItem(
  itemId: number,
  fulfillments: FinancialTransactionFulfillment[],
  excludedFulfillmentId?: number,
) {
  return roundCurrency(
    fulfillments
      .filter((fulfillment) => fulfillment.id !== excludedFulfillmentId)
      .flatMap((fulfillment) => fulfillment.allocations ?? [])
      .filter((allocation) => allocation.itemId === itemId)
      .reduce((sum, allocation) => sum + allocation.amount, 0),
  );
}

function buildAllocationRows(params: {
  transactionItems: FinancialTransactionItem[];
  transactionFulfillments: FinancialTransactionFulfillment[];
  fulfillment?: FinancialTransactionFulfillment;
  allocations: FulfillmentAllocationFormData[];
  getItemLabel: (item: FinancialTransactionItem) => string;
}): AllocationEditorRow[] {
  return params.transactionItems
    .filter((item) => (item.amount ?? 0) > 0)
    .map((item) => {
      const alreadyAllocatedAmount = getAllocatedAmountForItem(
        item.id,
        params.transactionFulfillments,
        params.fulfillment?.id,
      );
      const allocatedAmount = params.allocations.find(
        (allocation) => allocation.itemId === item.id,
      )?.amount;

      return {
        itemKey: item.id,
        label: params.getItemLabel(item),
        itemAmount: roundCurrency(item.amount ?? 0),
        alreadyAllocatedAmount,
        availableAmount: roundCurrency(
          (item.amount ?? 0) - alreadyAllocatedAmount,
        ),
        allocatedAmount,
      };
    });
}

export function FulfillmentDialog({
  open,
  onClose,
  transaction,
  fulfillment,
  transactionItems,
  transactionFulfillments,
  activeBankAccounts,
  getItemLabel,
  onSave,
  saving = false,
}: Props) {
  const [allocations, setAllocations] = useState<
    FulfillmentAllocationFormData[]
  >([]);
  const maximumPayableAmount = useMemo(
    () => getMaximumPayableAmount(transaction, fulfillment),
    [fulfillment, transaction],
  );
  const fulfillmentSchema = useMemo(
    () => createFulfillmentSchema(maximumPayableAmount),
    [maximumPayableAmount],
  );
  const { control, formState, handleSubmit, reset, watch } =
    useForm<FulfillmentFormValues>({
      defaultValues: getDefaultValues(transaction, fulfillment),
      resolver: zodResolver(fulfillmentSchema),
    });
  const amountValue = watch('amount');
  const amount = Number(amountValue || 0);
  const paymentAmount = roundCurrency(Number.isFinite(amount) ? amount : 0);
  const allocationRows = useMemo(
    () =>
      buildAllocationRows({
        transactionItems,
        transactionFulfillments,
        fulfillment,
        allocations,
        getItemLabel,
      }),
    [
      allocations,
      fulfillment,
      getItemLabel,
      transactionFulfillments,
      transactionItems,
    ],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultValues = getDefaultValues(transaction, fulfillment);
    const initialAllocations = getInitialAllocations(fulfillment);
    reset(defaultValues);
    setAllocations(
      initialAllocations.length > 0
        ? initialAllocations
        : buildSuggestedAllocations(
            buildAllocationRows({
              transactionItems,
              transactionFulfillments,
              fulfillment,
              allocations: [],
              getItemLabel,
            }),
            Number(defaultValues.amount || 0),
          ).map((allocation) => ({
            itemId: Number(allocation.itemKey),
            amount: allocation.amount,
          })),
    );
  }, [
    fulfillment,
    getItemLabel,
    open,
    reset,
    transaction,
    transactionFulfillments,
    transactionItems,
  ]);

  const disabled = saving || formState.isSubmitting;

  const updateAllocation = (itemKey: AllocationKey, amount?: number) => {
    const itemId = Number(itemKey);

    setAllocations((current) => {
      const nextAllocations = current.filter(
        (allocation) => allocation.itemId !== itemId,
      );

      if (amount !== undefined) {
        nextAllocations.push({
          itemId,
          amount,
        });
      }

      return nextAllocations;
    });
  };

  const suggestAllocations = () => {
    setAllocations(
      buildSuggestedAllocations(allocationRows, paymentAmount).map(
        (allocation) => ({
          itemId: Number(allocation.itemKey),
          amount: allocation.amount,
        }),
      ),
    );
  };

  const handleFormSubmit = handleSubmit(async (values) => {
    const amountPaid = Number(values.amount);
    const rows = buildAllocationRows({
      transactionItems,
      transactionFulfillments,
      fulfillment,
      allocations,
      getItemLabel,
    });
    const validationMessage = validateAllocationRows(rows, amountPaid);

    if (validationMessage) {
      window.alert(validationMessage);
      return;
    }

    const validItemIds = new Set(transactionItems.map((item) => item.id));
    const payloadAllocations = allocations.flatMap((allocation) => {
      const allocationAmount = roundCurrency(allocation.amount ?? 0);

      if (!validItemIds.has(allocation.itemId) || allocationAmount <= 0) {
        return [];
      }

      return [{
        itemId: allocation.itemId,
        amount: allocationAmount,
      }];
    });

    await onSave(
      Number(values.bankId),
      values.date,
      amountPaid,
      payloadAllocations,
      values.observation.trim(),
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {fulfillment ? 'Editar Pagamento' : 'Registrar Pagamento'}
      </DialogTitle>
      <DialogContent>
        {transaction && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {transaction.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total da transação: {fmtBRL(transaction.totalAmount ?? 0)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {fulfillment ? 'Limite deste pagamento' : 'Pagamento pendente'}:{' '}
              {fmtBRL(maximumPayableAmount)}
            </Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="bankId"
            label="Conta Bancaria"
            select
            fullWidth
            size="small"
          >
            {activeBankAccounts.map((bankAccount) => (
              <MenuItem key={bankAccount.id} value={String(bankAccount.id)}>
                {bankAccount.name}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            control={control}
            name="date"
            label="Data do Pagamento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <FormTextField
            control={control}
            name="amount"
            label="Valor total deste pagamento(R$)"
            type="number"
            fullWidth
            inputProps={{
              min: 0,
              max: Number.isFinite(maximumPayableAmount)
                ? maximumPayableAmount
                : undefined,
              step: '0.01',
            }}
          />
          <FulfillmentAllocationEditor
            rows={allocationRows}
            paymentAmount={paymentAmount}
            disabled={disabled}
            onAllocationChange={updateAllocation}
            onSuggest={suggestAllocations}
          />
          <FormTextField
            control={control}
            name="observation"
            label="Observacao"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={disabled}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="success"
          disabled={disabled}
          onClick={() => {
            void handleFormSubmit();
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
