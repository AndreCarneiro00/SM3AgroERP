import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import type { AttachmentStorageProvider } from '../../../domains/financial/api/dtos';
import type {
  FinancialTransactionAttachment,
  FinancialTransactionAttachmentInput,
} from '../../../domains/financial/model/entities';
import type { DocumentType } from '../../../domains/master-data/model/entities';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: FinancialTransactionAttachment;
  financialTransactionId?: number;
  documentTypes: DocumentType[];
  onSave: (input: FinancialTransactionAttachmentInput) => void | Promise<void>;
  saving?: boolean;
}

function getInitialForm(
  financialTransactionId?: number,
  editing?: FinancialTransactionAttachment,
): FinancialTransactionAttachmentInput {
  return {
    financialTransactionId:
      editing?.financialTransactionId ?? financialTransactionId,
    documentTypeId: editing?.documentTypeId,
    storageProvider:
      (editing?.storageProvider as AttachmentStorageProvider | undefined) ??
      'LOCAL',
    observation: editing?.observation,
  };
}

export function TransactionAttachmentDialog({
  open,
  onClose,
  editing,
  financialTransactionId,
  documentTypes,
  onSave,
  saving = false,
}: Props) {
  const [form, setForm] = useState<FinancialTransactionAttachmentInput>(
    getInitialForm(financialTransactionId, editing),
  );

  useEffect(() => {
    if (!open) return;
    setForm(getInitialForm(financialTransactionId, editing));
  }, [editing, financialTransactionId, open]);

  const saveDisabled =
    saving ||
    !form.financialTransactionId ||
    !form.documentTypeId ||
    (!editing && !form.file);

  const handleSave = async () => {
    await onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Anexo' : 'Novo Anexo'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {editing && (
            <Typography variant="body2" color="text.secondary">
              Arquivo atual: {editing.fileName}
            </Typography>
          )}

          <FormControl fullWidth size="small">
            <InputLabel>Tipo Documento</InputLabel>
            <Select
              value={String(form.documentTypeId ?? '')}
              label="Tipo Documento"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  documentTypeId: Number(event.target.value),
                }))
              }
            >
              {documentTypes.map((documentType) => (
                <MenuItem key={documentType.id} value={String(documentType.id)}>
                  {documentType.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Storage</InputLabel>
            <Select
              value={form.storageProvider ?? 'LOCAL'}
              label="Storage"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  storageProvider: event.target.value as AttachmentStorageProvider,
                }))
              }
            >
              <MenuItem value="LOCAL">LOCAL</MenuItem>
              <MenuItem value="ONEDRIVE">ONEDRIVE</MenuItem>
              <MenuItem value="S3">S3</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Observacao"
            value={form.observation ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                observation: event.target.value || undefined,
              }))
            }
            fullWidth
            multiline
            rows={2}
          />

          <Button
            component="label"
            variant="outlined"
            startIcon={<AttachFileIcon />}
          >
            {form.file?.name ?? (editing ? 'Trocar arquivo' : 'Selecionar arquivo')}
            <input
              hidden
              type="file"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  file: event.target.files?.[0],
                }))
              }
            />
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={saveDisabled}
          onClick={() => {
            void handleSave();
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
