import { useEffect } from 'react';
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
import type { FinancialTransaction } from '../../../domains/financial/model/entities';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction;
  activeBankAccounts: BankAccount[];
  onSave: (
    bankId: number,
    date: string,
    amount: number,
    observation: string,
  ) => void | Promise<void>;
  saving?: boolean;
}

const fulfillmentSchema = z.object({
  bankId: z.string().min(1, 'Selecione a conta bancaria.'),
  date: z.string().min(1, 'Informe a data do pagamento.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor pago.')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      'Informe um valor pago valido.',
    ),
  observation: z.string(),
});

type FulfillmentFormValues = z.infer<typeof fulfillmentSchema>;

function getDefaultValues(
  transaction?: FinancialTransaction,
): FulfillmentFormValues {
  return {
    bankId: '',
    date: todayIsoDate(),
    amount: toInputValue(transaction?.totalAmount),
    observation: '',
  };
}

export function FulfillmentDialog({
  open,
  onClose,
  transaction,
  activeBankAccounts,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<FulfillmentFormValues>({
      defaultValues: getDefaultValues(transaction),
      resolver: zodResolver(fulfillmentSchema),
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(getDefaultValues(transaction));
  }, [open, reset, transaction]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave(
      Number(values.bankId),
      values.date,
      Number(values.amount),
      values.observation.trim(),
    );
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Registrar Pagamento</DialogTitle>
      <DialogContent>
        {transaction && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              {transaction.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {fmtBRL(transaction.totalAmount ?? 0)}
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
            label="Valor Pago (R$)"
            type="number"
            fullWidth
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
