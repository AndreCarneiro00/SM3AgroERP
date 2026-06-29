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
  requiredTextFromInput,
  toInputValue,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  Product,
  ProductFamily,
  ProductInput,
  ProductType,
  UnitOfMeasure,
} from '../../../domains/products/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product;
  productFamilies: ProductFamily[];
  unitsOfMeasure: UnitOfMeasure[];
  onSave: (data: ProductInput) => void | Promise<void>;
  saving?: boolean;
}

const productTypeValues = [
  'RAW_MATERIAL',
  'FINISHED_GOOD',
  'CONSUMABLE',
  'SPARE_PART',
  'SERVICE',
] as const;

const productStatusValues = ['active', 'inactive'] as const;

const productTypeOptions: Array<{ value: ProductType; label: string }> = [
  { value: 'RAW_MATERIAL', label: 'Materia-prima' },
  { value: 'FINISHED_GOOD', label: 'Produto acabado' },
  { value: 'CONSUMABLE', label: 'Consumivel' },
  { value: 'SPARE_PART', label: 'Peca de reposicao' },
  { value: 'SERVICE', label: 'Servico' },
];

const productSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do produto.'),
  familyId: z.string(),
  unitId: z.string(),
  productType: z.enum(productTypeValues),
  active: z.enum(productStatusValues),
});

type ProductFormValues = z.infer<typeof productSchema>;

function getDefaultValues(editing?: Product): ProductFormValues {
  return {
    name: editing?.name ?? '',
    familyId: toInputValue(editing?.productFamilyId),
    unitId: toInputValue(editing?.unitId),
    productType: editing?.productType ?? 'FINISHED_GOOD',
    active: editing?.active === false ? 'inactive' : 'active',
  };
}

export function ProductDialog({
  open,
  onClose,
  editing,
  productFamilies,
  unitsOfMeasure,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<ProductFormValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(productSchema),
    });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      name: requiredTextFromInput(values.name),
      productFamilyId: optionalIdFromInput(values.familyId),
      unitId: optionalIdFromInput(values.unitId),
      productType: values.productType,
      active: values.active === 'active',
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="name"
            label="Nome do Produto"
            fullWidth
          />
          <FormTextField
            control={control}
            name="familyId"
            label="Familia"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="">- Nenhuma -</MenuItem>
            {productFamilies.map((family) => (
              <MenuItem key={family.id} value={String(family.id)}>
                {family.name}
              </MenuItem>
            ))}
          </FormTextField>
          <FormTextField
            control={control}
            name="unitId"
            label="Unidade de Medida"
            select
            fullWidth
            size="small"
          >
            <MenuItem value="">- Nenhuma -</MenuItem>
            {unitsOfMeasure.map((unit) => (
              <MenuItem key={unit.id} value={String(unit.id)}>
                {unit.name}
              </MenuItem>
            ))}
          </FormTextField>
          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="productType"
              label="Tipo do Produto"
              select
              fullWidth
              size="small"
            >
              {productTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </FormTextField>
            <FormTextField
              control={control}
              name="active"
              label="Status"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="active">Ativo</MenuItem>
              <MenuItem value="inactive">Inativo</MenuItem>
            </FormTextField>
          </Stack>
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
