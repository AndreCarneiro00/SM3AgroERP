import { useEffect, useMemo } from 'react';
import {
  Alert,
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
} from '../../../domains/financial/model/entities';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

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
  activeBankAccounts: BankAccount[];
  onSave: (
    bankId: number,
    date: string,
    amount: number,
    observation: string,
  ) => void | Promise<void>;
  saving?: boolean;
}

type FulfillmentFormValues = z.infer<ReturnType<typeof createFulfillmentSchema>>;

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

export function FulfillmentDialog({
  open,
  onClose,
  transaction,
  fulfillment,
  activeBankAccounts,
  onSave,
  saving = false,
}: Props) {
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

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(getDefaultValues(transaction, fulfillment));
  }, [fulfillment, open, reset, transaction]);

  const disabled = saving || formState.isSubmitting;
  const isEditing = !!fulfillment;
  const selectedBankId = watch('bankId');
  const paymentAmount = Number(watch('amount'));
  const selectedBankAccount = activeBankAccounts.find(
    (bankAccount) => String(bankAccount.id) === selectedBankId,
  );
  const shouldWarnAboutCurrentBalance =
    transaction?.type === 'EXPENSE' &&
    selectedBankAccount?.currentBalance !== undefined &&
    Number.isFinite(paymentAmount) &&
    selectedBankAccount.currentBalance < paymentAmount;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave(
      isEditing ? fulfillment.bankAccountId : Number(values.bankId),
      isEditing ? fulfillment.paymentDate : values.date,
      isEditing ? fulfillment.amountPaid : Number(values.amount),
      values.observation.trim(),
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
              Total: {fmtBRL(transaction.totalAmount ?? 0)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {fulfillment ? 'Limite deste pagamento' : 'Saldo disponivel'}:{' '}
              {fmtBRL(maximumPayableAmount)}
            </Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {isEditing && (
            <Alert severity="info">
              Pagamentos registrados preservam conta, data, valor e alocacoes.
              Apenas a observacao pode ser editada.
            </Alert>
          )}

          {selectedBankAccount && (
            <Alert severity={shouldWarnAboutCurrentBalance ? 'warning' : 'info'}>
              Saldo atual de {selectedBankAccount.name}:{' '}
              {fmtBRL(selectedBankAccount.currentBalance ?? 0)}
              {shouldWarnAboutCurrentBalance
                ? '. A validacao final considera a linha do tempo no backend.'
                : ''}
            </Alert>
          )}

          <FormTextField
            control={control}
            name="bankId"
            label="Conta Bancaria"
            select
            fullWidth
            size="small"
            disabled={isEditing}
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
            disabled={isEditing}
            InputLabelProps={{ shrink: true }}
          />
          <FormTextField
            control={control}
            name="amount"
            label="Valor Pago (R$)"
            type="number"
            fullWidth
            disabled={isEditing}
            inputProps={{
              min: 0,
              max: Number.isFinite(maximumPayableAmount)
                ? maximumPayableAmount
                : undefined,
              step: '0.01',
            }}
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
