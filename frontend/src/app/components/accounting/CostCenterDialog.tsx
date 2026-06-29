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
  optionalIdFromInput,
  optionalTextFromInput,
  requiredTextFromInput,
  toInputValue,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  CostCenter,
  CostCenterInput,
} from '../../../domains/accounting/model/entities';
import type { ActivityGroup } from '../../../domains/master-data/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: CostCenter;
  parentId?: number;
  parentName?: string;
  activityGroups: ActivityGroup[];
  onSave: (data: CostCenterInput) => void | Promise<void>;
  saving?: boolean;
}

const costCenterTypeValues = ['CAPEX', 'OPEX'] as const;
const yesNoValues = ['sim', 'nao'] as const;

const costCenterSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do centro de custo.'),
  code: z.string(),
  type: z.enum(costCenterTypeValues),
  description: z.string(),
  accepts: z.enum(yesNoValues),
  activityGroupId: z.string(),
});

type CostCenterFormValues = z.infer<typeof costCenterSchema>;

function getDefaultValues(editing?: CostCenter): CostCenterFormValues {
  return {
    name: editing?.name ?? '',
    code: editing?.code ?? '',
    type: editing?.type ?? 'OPEX',
    description: editing?.description ?? '',
    accepts: editing?.acceptsTransaction === false ? 'nao' : 'sim',
    activityGroupId: toInputValue(editing?.activityGroupId),
  };
}

export function CostCenterDialog({
  open,
  onClose,
  editing,
  parentId,
  parentName,
  activityGroups,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<CostCenterFormValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(costCenterSchema),
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
      description: optionalTextFromInput(values.description),
      acceptsTransaction: values.accepts === 'sim',
      active: true,
      activityGroupId: optionalIdFromInput(values.activityGroupId),
      parentId: editing ? editing.parentId : parentId,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing
          ? 'Editar Centro de Custo'
          : parentId
            ? 'Novo Sub-centro'
            : 'Novo Centro de Custo'}
      </DialogTitle>
      <DialogContent>
        {parentId && !editing && (
          <Box sx={{ mb: 1.5, p: 1, bgcolor: '#E8F5E9', borderRadius: 1 }}>
            <Typography variant="caption">Pai: {parentName}</Typography>
          </Box>
        )}
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField control={control} name="name" label="Nome" fullWidth />
          <Stack direction="row" spacing={1.5}>
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
              <MenuItem value="CAPEX">CAPEX</MenuItem>
              <MenuItem value="OPEX">OPEX</MenuItem>
            </FormTextField>
          </Stack>
          <FormTextField
            control={control}
            name="description"
            label="Descricao"
            fullWidth
          />
          <FormTextField
            control={control}
            name="activityGroupId"
            label="Grupo de Atividade"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="">- Nenhum -</MenuItem>
            {activityGroups.map((activityGroup) => (
              <MenuItem key={activityGroup.id} value={String(activityGroup.id)}>
                {activityGroup.name}
              </MenuItem>
            ))}
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
            <MenuItem value="nao">Nao</MenuItem>
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
