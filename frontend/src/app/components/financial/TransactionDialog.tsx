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
import { toInputValue } from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type { FinancialTransaction } from '../../../domains/financial/model/entities';
import type { Counterparty } from '../../../domains/master-data/model/entities';

export interface TransactionFormData {
  description: string;
  counterpartyId: string;
  issueDate: string;
  dueDate: string;
  documentNumber: string;
  status: string;
  type: string;
  observation: string;
  hasNf: boolean;
  totalAmount: string;
}

const transactionStatusValues = [
  'PENDING',
  'PAID',
  'PARTIAL',
  'CANCELED',
] as const;

const transactionTypeValues = ['INCOME', 'EXPENSE'] as const;
const yesNoValues = ['yes', 'no'] as const;

const transactionSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descricao.'),
  counterpartyId: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  documentNumber: z.string(),
  status: z.enum(transactionStatusValues),
  type: z.enum(transactionTypeValues),
  observation: z.string(),
  hasNf: z.enum(yesNoValues),
  totalAmount: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      'Informe um valor total valido.',
    ),
});

type TransactionDialogValues = z.infer<typeof transactionSchema>;

function getDefaultValues(
  editing?: FinancialTransaction,
): TransactionDialogValues {
  return {
    description: editing?.description ?? '',
    counterpartyId: toInputValue(editing?.counterpartyId),
    issueDate: editing?.issueDate ?? '',
    dueDate: editing?.dueDate ?? '',
    documentNumber: editing?.documentNumber ?? '',
    status: editing?.status ?? 'PENDING',
    type: editing?.type ?? 'EXPENSE',
    observation: editing?.observation ?? '',
    hasNf: editing?.hasNf ? 'yes' : 'no',
    totalAmount: toInputValue(editing?.totalAmount),
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: FinancialTransaction;
  counterparties: Counterparty[];
  onSave: (data: TransactionFormData) => void | Promise<void>;
  saving?: boolean;
}

export function TransactionDialog({
  open,
  onClose,
  editing,
  counterparties,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<TransactionDialogValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(transactionSchema),
    });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      description: values.description.trim(),
      counterpartyId: values.counterpartyId,
      issueDate: values.issueDate.trim(),
      dueDate: values.dueDate.trim(),
      documentNumber: values.documentNumber.trim(),
      status: values.status,
      type: values.type,
      observation: values.observation.trim(),
      hasNf: values.hasNf === 'yes',
      totalAmount: values.totalAmount.trim(),
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Transacao' : 'Nova Transacao'}</DialogTitle>
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
              name="status"
              label="Status"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="PENDING">Pendente</MenuItem>
              <MenuItem value="PAID">Pago</MenuItem>
              <MenuItem value="PARTIAL">Parcial</MenuItem>
              <MenuItem value="CANCELED">Cancelado</MenuItem>
            </FormTextField>
          </Stack>

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

          <FormTextField
            control={control}
            name="documentNumber"
            label="Numero Documento"
            fullWidth
          />

          <FormTextField
            control={control}
            name="totalAmount"
            label="Valor Total (R$)"
            type="number"
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
          <FormTextField
            control={control}
            name="observation"
            label="Observacao"
            fullWidth
            multiline
            rows={2}
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
