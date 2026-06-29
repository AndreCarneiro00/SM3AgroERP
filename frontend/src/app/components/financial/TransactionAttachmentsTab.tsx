import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { FinancialTransactionAttachment } from '../../../domains/financial/model/entities';
import {
  selectFinancialTransactionLabelById,
} from '../../../domains/financial/selectors/selectors';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import {
  selectDocumentTypeLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

function toFinancialTransactionAttachmentInput(
  form: Partial<FinancialTransactionAttachment>,
) {
  return {
    financialTransactionId: form.financialTransactionId,
    fileName: form.fileName ?? '',
    declaredContentType: form.declaredContentType,
    sizeBytes: form.sizeBytes,
    documentTypeId: form.documentTypeId,
    storageProvider: form.storageProvider ?? 'LOCAL',
    storagePath: form.storagePath,
    externalFileId: form.externalFileId,
    externalParentId: form.externalParentId,
    webUrl: form.webUrl,
    checksumSha256: form.checksumSha256,
    uploadedAt: form.uploadedAt,
    active: form.active ?? true,
    observation: form.observation,
  };
}

export function TransactionAttachmentsTab() {
  const {
    catalog: financialCatalog,
    financialTransactionAttachments,
    financialTransactions,
  } = useFinancialCatalogData();
  const {
    createFinancialTransactionAttachment,
    updateFinancialTransactionAttachment,
    deleteFinancialTransactionAttachment,
  } = useFinancialMutations();
  const { catalog, documentTypes } = useMasterDataCatalogData();

  const getDocumentTypeName = (documentTypeId?: number) =>
    selectDocumentTypeLabelById(catalog, documentTypeId);

  return (
    <CrudTable<FinancialTransactionAttachment>
      items={financialTransactionAttachments}
      onCreate={(input) =>
        createFinancialTransactionAttachment.mutateAsync(
          toFinancialTransactionAttachmentInput(input),
        )
      }
      onUpdate={({ id, input }) =>
        updateFinancialTransactionAttachment.mutateAsync({
          id,
          input: toFinancialTransactionAttachmentInput(input),
        })
      }
      onDelete={(id) => deleteFinancialTransactionAttachment.mutateAsync(id)}
      actionLabel="Novo Anexo"
      dialogTitle={(editing) =>
        editing ? 'Editar Anexo Financeiro' : 'Novo Anexo Financeiro'
      }
      createInitial={() => ({ storageProvider: 'LOCAL', active: true })}
      columns={[
        {
          label: 'Transacao',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {selectFinancialTransactionLabelById(
                financialCatalog,
                item.financialTransactionId,
              )}
            </Typography>
          ),
        },
        { label: 'Arquivo', render: (item) => item.fileName },
        {
          label: 'Tipo Documento',
          render: (item) => getDocumentTypeName(item.documentTypeId),
        },
        { label: 'Armazenamento', render: (item) => item.storageProvider },
        {
          label: 'Referencia',
          render: (item) =>
            item.storagePath ?? item.webUrl ?? item.externalFileId ?? '-',
        },
        {
          label: 'Status',
          render: (item) => (
            <Chip
              label={item.active ? 'Ativo' : 'Inativo'}
              size="small"
              color={item.active ? 'success' : 'default'}
              sx={{ height: 20 }}
            />
          ),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Transacao</InputLabel>
            <Select
              value={String(form.financialTransactionId ?? '')}
              label="Transacao"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  financialTransactionId: Number(event.target.value),
                }))
              }
            >
              {financialTransactions.map((financialTransaction) => (
                <MenuItem
                  key={financialTransaction.id}
                  value={String(financialTransaction.id)}
                >
                  {financialTransaction.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Nome do Arquivo"
              value={form.fileName ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fileName: event.target.value,
                }))
              }
              fullWidth
            />
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
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Storage Provider</InputLabel>
              <Select
                value={String(form.storageProvider ?? 'LOCAL')}
                label="Storage Provider"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    storageProvider:
                      event.target.value as FinancialTransactionAttachment['storageProvider'],
                  }))
                }
              >
                <MenuItem value="LOCAL">LOCAL</MenuItem>
                <MenuItem value="ONEDRIVE">ONEDRIVE</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={form.active === false ? 'inactive' : 'active'}
                label="Status"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    active: event.target.value === 'active',
                  }))
                }
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Content Type Declarado"
            value={form.declaredContentType ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                declaredContentType: event.target.value || undefined,
              }))
            }
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Tamanho (bytes)"
              type="number"
              value={String(form.sizeBytes ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sizeBytes: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              fullWidth
            />
            <TextField
              label="Upload em"
              type="datetime-local"
              value={form.uploadedAt ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  uploadedAt: event.target.value || undefined,
                }))
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField
            label="Storage Path"
            value={form.storagePath ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                storagePath: event.target.value || undefined,
              }))
            }
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="External File ID"
              value={form.externalFileId ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  externalFileId: event.target.value || undefined,
                }))
              }
              fullWidth
            />
            <TextField
              label="External Parent ID"
              value={form.externalParentId ?? ''}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  externalParentId: event.target.value || undefined,
                }))
              }
              fullWidth
            />
          </Stack>
          <TextField
            label="Web URL"
            value={form.webUrl ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                webUrl: event.target.value || undefined,
              }))
            }
            fullWidth
          />
          <TextField
            label="Checksum SHA-256"
            value={form.checksumSha256 ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                checksumSha256: event.target.value || undefined,
              }))
            }
            fullWidth
          />
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
        </>
      )}
      normalize={(form) => ({
        ...form,
        uploadedAt: form.uploadedAt || new Date().toISOString().slice(0, 16),
      })}
      isSaveDisabled={(form) =>
        !form.financialTransactionId ||
        !form.fileName ||
        !form.documentTypeId ||
        !form.storageProvider ||
        (!form.storagePath && !form.externalFileId && !form.webUrl)
      }
      emptyMessage="Nenhum anexo financeiro cadastrado."
    />
  );
}
