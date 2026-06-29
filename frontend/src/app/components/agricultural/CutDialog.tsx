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
  optionalIdFromInput,
  optionalNumberFromInput,
  optionalTextFromInput,
  toInputValue,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  Cut,
  CutInput,
  Field,
} from '../../../domains/agricultural/model/entities';
import type { ProductFamily } from '../../../domains/products/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Cut;
  fields: Field[];
  productFamilies: ProductFamily[];
  onSave: (data: CutInput) => void | Promise<void>;
  saving?: boolean;
}

const cutSchema = z.object({
  fieldId: z.string().min(1, 'Selecione o campo.'),
  productFamilyId: z.string().min(1, 'Selecione a familia do produto.'),
  cutDate: z.string(),
  cutNumber: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      'Informe um numero de corte valido.',
    ),
  days: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      'Informe a quantidade de dias valida.',
    ),
  observation: z.string(),
});

type CutFormValues = z.infer<typeof cutSchema>;

function getDefaultValues(editing?: Cut): CutFormValues {
  return {
    fieldId: toInputValue(editing?.fieldId),
    productFamilyId: toInputValue(editing?.productFamilyId),
    cutDate: editing?.cutDate ?? '',
    cutNumber: toInputValue(editing?.cutNumber),
    days: toInputValue(editing?.daysSinceLastCut),
    observation: editing?.observation ?? '',
  };
}

export function CutDialog({
  open,
  onClose,
  editing,
  fields,
  productFamilies,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } = useForm<CutFormValues>({
    defaultValues: getDefaultValues(editing),
    resolver: zodResolver(cutSchema),
  });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      fieldId: optionalIdFromInput(values.fieldId),
      productFamilyId: optionalIdFromInput(values.productFamilyId),
      cutDate: optionalTextFromInput(values.cutDate),
      cutNumber: optionalNumberFromInput(values.cutNumber),
      observation: optionalTextFromInput(values.observation),
      daysSinceLastCut: optionalNumberFromInput(values.days),
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Corte' : 'Novo Corte'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="fieldId"
            label="Campo"
            select
            fullWidth
            size="small"
          >
            {fields.map((field) => (
              <MenuItem key={field.id} value={String(field.id)}>
                {field.name}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            control={control}
            name="productFamilyId"
            label="Familia de Produto"
            select
            fullWidth
            size="small"
          >
            {productFamilies.map((productFamily) => (
              <MenuItem key={productFamily.id} value={String(productFamily.id)}>
                {productFamily.name}
              </MenuItem>
            ))}
          </FormTextField>
          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="cutNumber"
              label="Numero do Corte"
              type="number"
              fullWidth
            />
            <FormTextField
              control={control}
              name="cutDate"
              label="Data do Corte"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <FormTextField
            control={control}
            name="days"
            label="Dias desde ultimo corte"
            type="number"
            fullWidth
          />
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
