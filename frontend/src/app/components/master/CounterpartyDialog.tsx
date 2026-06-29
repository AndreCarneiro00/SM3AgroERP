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
  optionalTextFromInput,
  requiredTextFromInput,
  toInputValue,
} from '../../forms/valueParsers';
import { zodResolver } from '../../forms/zodResolver';
import type {
  Counterparty,
  CounterpartyInput,
  CounterpartyType,
  Segment,
} from '../../../domains/master-data/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Counterparty;
  counterpartyTypes: CounterpartyType[];
  segments: Segment[];
  onSave: (data: CounterpartyInput) => void | Promise<void>;
  saving?: boolean;
}

const documentTypeValues = ['CPF', 'CNPJ'] as const;
const statusValues = ['ativo', 'inativo'] as const;

const counterpartySchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(1, 'Informe a razao social ou nome legal.'),
  tradeName: z.string(),
  typeId: z.string(),
  segmentId: z.string(),
  documentType: z.union([z.literal(''), z.enum(documentTypeValues)]),
  document: z.string(),
  city: z.string(),
  state: z.string().trim().max(2, 'Use a UF com 2 letras.'),
  phone: z.string(),
  email: z
    .string()
    .trim()
    .refine(
      (value) => !value || z.string().email().safeParse(value).success,
      'Informe um e-mail valido.',
    ),
  active: z.enum(statusValues),
});

type CounterpartyFormValues = z.infer<typeof counterpartySchema>;

function getDefaultValues(editing?: Counterparty): CounterpartyFormValues {
  return {
    legalName: editing?.legalName ?? '',
    tradeName: editing?.tradeName ?? '',
    typeId: toInputValue(editing?.counterpartyTypeId),
    segmentId: toInputValue(editing?.segmentId),
    documentType: editing?.documentType ?? '',
    document: editing?.document ?? '',
    city: editing?.city ?? '',
    state: editing?.state ?? '',
    phone: editing?.phoneNumber ?? '',
    email: editing?.email ?? '',
    active: editing?.active === false ? 'inativo' : 'ativo',
  };
}

export function CounterpartyDialog({
  open,
  onClose,
  editing,
  counterpartyTypes,
  segments,
  onSave,
  saving = false,
}: Props) {
  const { control, formState, handleSubmit, reset } =
    useForm<CounterpartyFormValues>({
      defaultValues: getDefaultValues(editing),
      resolver: zodResolver(counterpartySchema),
    });

  useEffect(() => {
    reset(getDefaultValues(editing));
  }, [editing, open, reset]);

  const disabled = saving || formState.isSubmitting;

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSave({
      legalName: requiredTextFromInput(values.legalName),
      tradeName: optionalTextFromInput(values.tradeName),
      counterpartyTypeId: optionalIdFromInput(values.typeId),
      segmentId: optionalIdFromInput(values.segmentId),
      documentType: values.documentType || undefined,
      document: optionalTextFromInput(values.document),
      city: optionalTextFromInput(values.city),
      state: optionalTextFromInput(values.state)?.toUpperCase(),
      phoneNumber: optionalTextFromInput(values.phone),
      email: optionalTextFromInput(values.email),
      active: values.active === 'ativo',
    });
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Contraparte' : 'Nova Contraparte'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormTextField
            control={control}
            name="legalName"
            label="Razao Social / Nome Legal"
            fullWidth
          />
          <FormTextField
            control={control}
            name="tradeName"
            label="Nome Fantasia"
            fullWidth
          />

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="typeId"
              label="Tipo"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="">- Nenhum -</MenuItem>
              {counterpartyTypes.map((counterpartyType) => (
                <MenuItem key={counterpartyType.id} value={String(counterpartyType.id)}>
                  {counterpartyType.name}
                </MenuItem>
              ))}
            </FormTextField>
            <FormTextField
              control={control}
              name="segmentId"
              label="Segmento"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="">- Nenhum -</MenuItem>
              {segments.map((segment) => (
                <MenuItem key={segment.id} value={String(segment.id)}>
                  {segment.name}
                </MenuItem>
              ))}
            </FormTextField>
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="documentType"
              label="Tipo Documento"
              select
              fullWidth
              size="small"
            >
              <MenuItem value="">- Nenhum -</MenuItem>
              <MenuItem value="CNPJ">CNPJ</MenuItem>
              <MenuItem value="CPF">CPF</MenuItem>
            </FormTextField>
            <FormTextField
              control={control}
              name="document"
              label="CPF / CNPJ"
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="city"
              label="Cidade"
              fullWidth
            />
            <FormTextField
              control={control}
              name="state"
              label="UF"
              sx={{ width: 100 }}
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <FormTextField
              control={control}
              name="phone"
              label="Telefone"
              fullWidth
            />
            <FormTextField
              control={control}
              name="email"
              label="E-mail"
              fullWidth
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
