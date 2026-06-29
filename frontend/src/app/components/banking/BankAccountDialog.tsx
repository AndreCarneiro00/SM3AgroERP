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
  optionalNumberFromInput,
  optionalTextFromInput,
  requiredTextFromInput,
  toInputValue,
  todayIsoDate,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  BankAccount,
  BankAccountInput,
} from '../../../domains/banking/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: BankAccount;
  onSave: (data: BankAccountInput) => void | Promise<void>;
  saving?: boolean;
}

const bankAccountStatusValues = ['ativo', 'inativo'] as const;

const bankAccountSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conta.'),
  accountType: z.string().trim().min(1, 'Selecione o tipo de conta.'),
  accountGroup: z.string(),
  institution: z.string(),
  agency: z.string(),
  accountNumber: z.string(),
  balance: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      'Informe um saldo inicial valido.',
    ),
  balanceDate: z.string(),
  active: z.enum(bankAccountStatusValues),
});

type BankAccountFormValues = z.infer<typeof bankAccountSchema>;

function getDefaultValues(editing?: BankAccount): BankAccountFormValues {
  return {
    name: editing?.name ?? '',
    accountType: editing?.accountType ?? 'Conta Corrente',
    accountGroup: editing?.accountGroup ?? '',
    institution: editing?.financialInstitution ?? '',
    agency: editing?.agency ?? '',
    accountNumber: editing?.accountNumber ?? '',
    balance: toInputValue(editing?.initialBalance),
    balanceDate: editing?.initialBalanceDate ?? todayIsoDate(),
    active: editing?.active === false ? 'inativo' : 'ativo',
  };
}

export function BankAccountDialog({
  open,
  onClose,
  editing,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<BankAccountFormValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(bankAccountSchema),
    });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      name: requiredTextFromInput(values.name),
      accountType: optionalTextFromInput(values.accountType),
      accountGroup: optionalTextFromInput(values.accountGroup),
      financialInstitution: optionalTextFromInput(values.institution),
      agency: optionalTextFromInput(values.agency),
      accountNumber: optionalTextFromInput(values.accountNumber),
      initialBalance: optionalNumberFromInput(values.balance),
      initialBalanceDate: optionalTextFromInput(values.balanceDate),
      active: values.active === 'ativo',
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Conta Bancaria' : 'Nova Conta Bancaria'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="name"
            label="Nome da Conta"
            fullWidth
          />

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="accountType"
              label="Tipo de Conta"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="Conta Corrente">Conta Corrente</MenuItem>
              <MenuItem value="Poupanca">Poupanca</MenuItem>
              <MenuItem value="Investimento">Investimento</MenuItem>
              <MenuItem value="Caixa">Caixa</MenuItem>
              <MenuItem value="Credito Rural">Credito Rural</MenuItem>
            </FormTextField>
            <FormTextField
              control={control}
              name="accountGroup"
              label="Grupo"
              fullWidth
            />
          </Stack>

          <FormTextField
            control={control}
            name="institution"
            label="Instituicao Financeira"
            fullWidth
          />

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="agency"
              label="Agencia"
              fullWidth
            />
            <FormTextField
              control={control}
              name="accountNumber"
              label="Numero da Conta"
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="balance"
              label="Saldo Inicial (R$)"
              type="number"
              fullWidth
            />
            <FormTextField
              control={control}
              name="balanceDate"
              label="Data Saldo Inicial"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <FormTextField
            control={control}
            name="active"
            label="Status"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="ativo">Ativa</MenuItem>
            <MenuItem value="inativo">Inativa</MenuItem>
          </FormTextField>
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
