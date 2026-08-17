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
  requiredIdFromInput,
  requiredNumberFromInput,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  CutInput,
  Field,
} from '../../../domains/agricultural/model/entities';
import type { Product } from '../../../domains/products/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  fields: Field[];
  products: Product[];
  onSave: (data: CutInput) => void | Promise<void>;
  saving?: boolean;
}

const cutSchema = z.object({
  fieldId: z.string().min(1, 'Selecione o campo.'),
  productId: z.string().min(1, 'Selecione o produto.'),
  cutDate: z.string().min(1, 'Informe a data do corte.'),
  quantity: z
    .string()
    .trim()
    .min(1, 'Informe a quantidade produzida.')
    .refine(
      (value) => !Number.isNaN(Number(value)) && Number(value) > 0,
      'Informe uma quantidade valida.',
    ),
  unitCost: z
    .string()
    .trim()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      'Informe um custo unitario valido.',
    ),
  qualityGrade: z.string(),
  observation: z.string(),
});

type CutFormValues = z.infer<typeof cutSchema>;

function getDefaultValues(): CutFormValues {
  return {
    fieldId: '',
    productId: '',
    cutDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unitCost: '',
    qualityGrade: '',
    observation: '',
  };
}

export function CutDialog({
  open,
  onClose,
  fields,
  products,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } = useForm<CutFormValues>({
    defaultValues: getDefaultValues(),
    resolver: zodResolver(cutSchema),
  });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues());
    }
  }, [open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      fieldId: requiredIdFromInput(values.fieldId),
      productId: requiredIdFromInput(values.productId),
      cutDate: values.cutDate,
      quantity: requiredNumberFromInput(values.quantity),
      unitCost: optionalNumberFromInput(values.unitCost),
      qualityGrade: optionalTextFromInput(values.qualityGrade),
      observation: optionalTextFromInput(values.observation),
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo Corte</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1.5}>
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
              name="cutDate"
              label="Data do Corte"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <FormTextField
            control={control}
            name="productId"
            label="Produto Gerado"
            select
            fullWidth
            size="small"
          >
            {products.map((product) => (
              <MenuItem key={product.id} value={String(product.id)}>
                {product.name}
              </MenuItem>
            ))}
          </FormTextField>
          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="quantity"
              label="Quantidade Produzida"
              type="number"
              fullWidth
            />
            <FormTextField
              control={control}
              name="unitCost"
              label="Custo Unitario"
              type="number"
              fullWidth
            />
          </Stack>
          <FormTextField
            control={control}
            name="qualityGrade"
            label="Qualidade"
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
