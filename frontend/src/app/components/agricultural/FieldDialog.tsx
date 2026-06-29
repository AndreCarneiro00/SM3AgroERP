import { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormTextField } from '../../forms/FormTextField';
import {
  optionalNumberFromInput,
  requiredTextFromInput,
  toInputValue,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  Field,
  FieldInput,
} from '../../../domains/agricultural/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Field;
  onSave: (data: FieldInput) => void | Promise<void>;
  saving?: boolean;
}

const fieldSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do campo.'),
  area: z
    .string()
    .trim()
    .refine(
      (value) => !value || !Number.isNaN(Number(value)),
      'Informe uma area valida.',
    ),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

function getDefaultValues(editing?: Field): FieldFormValues {
  return {
    name: editing?.name ?? '',
    area: toInputValue(editing?.areaHectares),
  };
}

export function FieldDialog({
  open,
  onClose,
  editing,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } = useForm<FieldFormValues>({
    defaultValues: getDefaultValues(editing),
    resolver: zodResolver(fieldSchema),
  });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      name: requiredTextFromInput(values.name),
      areaHectares: optionalNumberFromInput(values.area),
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Campo' : 'Novo Campo Agricola'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="name"
            label="Nome do Campo"
            fullWidth
          />
          <FormTextField
            control={control}
            name="area"
            label="Area (hectares)"
            type="number"
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
