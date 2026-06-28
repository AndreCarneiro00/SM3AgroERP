import {
  Chip, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { FinancialTransactionAttachment } from '../../data/types';

export function TransactionAttachmentsTab() {
  const {
    financialTransactionAttachments,
    setFinancialTransactionAttachments,
    financialTransactions,
    documentTypes,
    nextId,
  } = useApp();

  return (
    <CrudTable<FinancialTransactionAttachment>
      items={financialTransactionAttachments}
      setItems={setFinancialTransactionAttachments}
      nextId={nextId}
      actionLabel="Novo Anexo"
      dialogTitle={(editing) => editing ? 'Editar Anexo Financeiro' : 'Novo Anexo Financeiro'}
      createInitial={() => ({ storage_provider: 'LOCAL', active: true })}
      columns={[
        {
          label: 'Transação',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {financialTransactions.find((transaction) => transaction.id === item.financial_transaction_id)?.description ?? '-'}
            </Typography>
          ),
        },
        { label: 'Arquivo', render: (item) => item.file_name },
        { label: 'Tipo Documento', render: (item) => documentTypes.find((documentType) => documentType.id === item.document_type_id)?.name ?? '-' },
        { label: 'Armazenamento', render: (item) => item.storage_provider },
        { label: 'Referência', render: (item) => item.storage_path ?? item.web_url ?? item.external_file_id ?? '-' },
        {
          label: 'Status',
          render: (item) => (
            <Chip label={item.active ? 'Ativo' : 'Inativo'} size="small" color={item.active ? 'success' : 'default'} sx={{ height: 20 }} />
          ),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Transação</InputLabel>
            <Select
              value={String(form.financial_transaction_id ?? '')}
              label="Transação"
              onChange={(event) => setForm((current) => ({ ...current, financial_transaction_id: Number(event.target.value) }))}
            >
              {financialTransactions.map((transaction) => (
                <MenuItem key={transaction.id} value={String(transaction.id)}>{transaction.description}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Nome do Arquivo"
              value={form.file_name ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, file_name: event.target.value }))}
              fullWidth
            />
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Documento</InputLabel>
              <Select
                value={String(form.document_type_id ?? '')}
                label="Tipo Documento"
                onChange={(event) => setForm((current) => ({ ...current, document_type_id: Number(event.target.value) }))}
              >
                {documentTypes.map((documentType) => (
                  <MenuItem key={documentType.id} value={String(documentType.id)}>{documentType.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Storage Provider</InputLabel>
              <Select
                value={String(form.storage_provider ?? 'LOCAL')}
                label="Storage Provider"
                onChange={(event) => setForm((current) => ({ ...current, storage_provider: event.target.value as FinancialTransactionAttachment['storage_provider'] }))}
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
                onChange={(event) => setForm((current) => ({ ...current, active: event.target.value === 'active' }))}
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <TextField
            label="Content Type Declarado"
            value={form.declared_content_type ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, declared_content_type: event.target.value || undefined }))}
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Tamanho (bytes)"
              type="number"
              value={String(form.size_bytes ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, size_bytes: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
            <TextField
              label="Upload em"
              type="datetime-local"
              value={form.uploaded_at ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, uploaded_at: event.target.value || undefined }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
          <TextField
            label="Storage Path"
            value={form.storage_path ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, storage_path: event.target.value || undefined }))}
            fullWidth
          />
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="External File ID"
              value={form.external_file_id ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, external_file_id: event.target.value || undefined }))}
              fullWidth
            />
            <TextField
              label="External Parent ID"
              value={form.external_parent_id ?? ''}
              onChange={(event) => setForm((current) => ({ ...current, external_parent_id: event.target.value || undefined }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Web URL"
            value={form.web_url ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, web_url: event.target.value || undefined }))}
            fullWidth
          />
          <TextField
            label="Checksum SHA-256"
            value={form.checksum_sha256 ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, checksum_sha256: event.target.value || undefined }))}
            fullWidth
          />
          <TextField
            label="Observação"
            value={form.observation ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, observation: event.target.value || undefined }))}
            fullWidth
            multiline
            rows={2}
          />
        </>
      )}
      normalize={(form) => ({
        ...form,
        uploaded_at: form.uploaded_at || new Date().toISOString().slice(0, 16),
      })}
      isSaveDisabled={(form) =>
        !form.financial_transaction_id ||
        !form.file_name ||
        !form.document_type_id ||
        !form.storage_provider ||
        (!form.storage_path && !form.external_file_id && !form.web_url)
      }
      emptyMessage="Nenhum anexo financeiro cadastrado."
    />
  );
}
