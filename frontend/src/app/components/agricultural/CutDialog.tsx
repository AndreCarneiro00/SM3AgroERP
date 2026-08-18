import { useEffect } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
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

function getProductCutRestriction(product: Product, cutDate: string) {
  if (!product.active) {
    return 'Produto inativo.';
  }
  if (product.hasStock !== true) {
    return 'Produto nao controla estoque.';
  }
  if (!product.stockControlStartDate) {
    return 'Produto sem data inicial de controle de estoque.';
  }
  if (cutDate && cutDate < product.stockControlStartDate) {
    return 'Data do corte anterior ao inicio do controle de estoque.';
  }

  return undefined;
}

export function CutDialog({
  open,
  onClose,
  fields,
  products,
  onSave,
  saving = false,
}: Props) {
  const { clearErrors, control, formState, handleSubmit, reset, setError } =
    useForm<CutFormValues>({
      defaultValues: getDefaultValues(),
      resolver: zodResolver(cutSchema),
    });
  const cutDate = useWatch({ control, name: 'cutDate' });
  const selectedProductId = useWatch({ control, name: 'productId' });

  useEffect(() => {
    if (open) {
      reset(getDefaultValues());
    }
  }, [open, reset]);

  useEffect(() => {
    clearErrors('productId');
  }, [clearErrors, cutDate, selectedProductId]);

  const disabled = saving || formState.isSubmitting;
  const hasEligibleProducts = products.some(
    (product) => !getProductCutRestriction(product, cutDate),
  );

  const handleFormSubmit = handleSubmit(async (values) => {
    const productId = requiredIdFromInput(values.productId);
    const selectedProduct = products.find((product) => product.id === productId);
    const productRestriction = selectedProduct
      ? getProductCutRestriction(selectedProduct, values.cutDate)
      : 'Selecione um produto valido.';

    if (productRestriction) {
      setError('productId', {
        type: 'manual',
        message: productRestriction,
      });
      return;
    }

    await onSave({
      fieldId: requiredIdFromInput(values.fieldId),
      productId,
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
          {!hasEligibleProducts && (
            <Alert severity="warning">
              Nenhum produto disponivel para corte na data informada. Cadastre
              ou ajuste um produto ativo com controle de estoque.
            </Alert>
          )}
          <FormTextField
            control={control}
            name="productId"
            label="Produto Gerado"
            select
            fullWidth
            size="small"
            helperText="Somente produtos ativos com controle de estoque iniciado ate a data do corte."
          >
            {products.map((product) => {
              const restriction = getProductCutRestriction(product, cutDate);

              return (
                <MenuItem
                  key={product.id}
                  value={String(product.id)}
                  disabled={!!restriction}
                >
                  {restriction
                    ? `${product.name} - ${restriction}`
                    : product.name}
                </MenuItem>
              );
            })}
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
          disabled={disabled || !hasEligibleProducts}
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
