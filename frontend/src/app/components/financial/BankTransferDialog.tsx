import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../forms/FormTextField';
import {
  optionalTextFromInput,
  toInputValue,
  todayIsoDate,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type { BankAccount } from '../../../domains/banking/model/entities';
import type {
  BankTransfer,
  BankTransferInput,
} from '../../../domains/financial/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: BankTransfer;
  activeBankAccounts: BankAccount[];
  onSave: (data: BankTransferInput) => void | Promise<void>;
  saving?: boolean;
}

const bankTransferSchema = z
  .object({
    source: z.string().min(1, 'Selecione a conta de origem.'),
    destination: z.string().min(1, 'Selecione a conta de destino.'),
    amount: z
      .string()
      .trim()
      .min(1, 'Informe o valor da transferencia.')
      .refine(
        (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
        'Informe um valor valido.',
      ),
    date: z.string().min(1, 'Informe a data da transferencia.'),
    observation: z.string(),
  })
  .refine((values) => values.source !== values.destination, {
    message: 'A conta de destino deve ser diferente da origem.',
    path: ['destination'],
  });

type BankTransferFormValues = z.infer<typeof bankTransferSchema>;

function getDefaultValues(editing?: BankTransfer): BankTransferFormValues {
  return {
    source: toInputValue(editing?.sourceBankAccountId),
    destination: toInputValue(editing?.destinationBankAccountId),
    amount: toInputValue(editing?.amount),
    date: editing?.transferDate ?? todayIsoDate(),
    observation: editing?.observation ?? '',
  };
}

export function BankTransferDialog({
  open,
  onClose,
  editing,
  activeBankAccounts,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset, watch } =
    useForm<BankTransferFormValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(bankTransferSchema),
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const source = watch('source');
  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      sourceBankAccountId: Number(values.source),
      destinationBankAccountId: Number(values.destination),
      amount: Number(values.amount),
      transferDate: values.date,
      observation: optionalTextFromInput(values.observation),
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Transferencia' : 'Nova Transferencia Bancaria'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="source"
            label="Conta Origem"
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
            name="destination"
            label="Conta Destino"
            select
            fullWidth
            size="small"
          >
            {activeBankAccounts
              .filter((bankAccount) => String(bankAccount.id) !== source)
              .map((bankAccount) => (
                <MenuItem key={bankAccount.id} value={String(bankAccount.id)}>
                  {bankAccount.name}
                </MenuItem>
              ))}
          </FormTextField>
          <FormTextField
            control={control}
            name="amount"
            label="Valor (R$)"
            type="number"
            fullWidth
          />
          <FormTextField
            control={control}
            name="date"
            label="Data"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
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
          disabled={disabled}
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
