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
import {
  optionalTextFromInput,
  requiredTextFromInput,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  ChartOfAccount,
  ChartOfAccountInput,
} from '../../../domains/accounting/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: ChartOfAccount;
  parentId?: number;
  parentName?: string;
  onSave: (data: ChartOfAccountInput) => void | Promise<void>;
  saving?: boolean;
}

const chartTypeValues = [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
  'MANAGERIAL',
] as const;

const yesNoValues = ['sim', 'nao'] as const;
const activeValues = ['ativo', 'inativo'] as const;

const chartSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome da conta.'),
  code: z.string(),
  type: z.enum(chartTypeValues),
  accepts: z.enum(yesNoValues),
  active: z.enum(activeValues),
});

type ChartFormValues = z.infer<typeof chartSchema>;

function getDefaultValues(editing?: ChartOfAccount): ChartFormValues {
  return {
    name: editing?.name ?? '',
    code: editing?.code ?? '',
    type: editing?.type ?? 'EXPENSE',
    accepts: editing?.acceptsTransaction === false ? 'nao' : 'sim',
    active: editing?.active === false ? 'inativo' : 'ativo',
  };
}

export function ChartDialog({
  open,
  onClose,
  editing,
  parentId,
  parentName,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } = useForm<ChartFormValues>({
    defaultValues: getDefaultValues(editing),
    resolver: zodResolver(chartSchema),
  });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      name: requiredTextFromInput(values.name),
      code: optionalTextFromInput(values.code),
      type: values.type,
      acceptsTransaction: values.accepts === 'sim',
      active: values.active === 'ativo',
      parentId: editing ? editing.parentId : parentId,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Conta' : parentId ? 'Nova Subconta' : 'Nova Conta Raiz'}
      </DialogTitle>
      <DialogContent>
        {parentId && !editing && (
          <Box sx={{ mb: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
            <Typography variant="caption">Pai: {parentName}</Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField control={control} name="name" label="Nome" fullWidth />
          <FormTextField
            control={control}
            name="code"
            label="Codigo"
            fullWidth
          />
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
            <MenuItem value="TRANSFER">Transferencia</MenuItem>
            <MenuItem value="MANAGERIAL">Gerencial</MenuItem>
          </FormTextField>
          <FormTextField
            control={control}
            name="accepts"
            label="Aceita Lancamentos"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="sim">Sim</MenuItem>
            <MenuItem value="nao">Nao (analitico)</MenuItem>
          </FormTextField>
          <FormTextField
            control={control}
            name="active"
            label="Status"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
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
