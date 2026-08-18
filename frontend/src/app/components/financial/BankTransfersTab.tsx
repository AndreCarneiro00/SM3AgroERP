import { useState } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import {
  selectBankAccountLabelById,
} from '../../../domains/banking/selectors/selectors';
import { useBankAccountsData } from '../../../domains/banking/ui/hooks';
import type {
  BankTransfer,
  BankTransferInput,
} from '../../../domains/financial/model/entities';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import { extractApiErrorMessage } from '../../../core/http/client';
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { BankTransferDialog } from './BankTransferDialog';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');

export function BankTransfersTab() {
  const { activeBankAccounts, catalog } = useBankAccountsData();
  const { bankTransfers } = useFinancialCatalogData();
  const {
    createBankTransfer,
    updateBankTransfer,
    deleteBankTransfer,
  } = useFinancialMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankTransfer | undefined>();

  const sorted = [...bankTransfers].sort((left, right) =>
    right.transferDate.localeCompare(left.transferDate),
  );

  const handleSave = async (input: BankTransferInput) => {
    try {
      if (editing) {
        await updateBankTransfer.mutateAsync({ id: editing.id, input });
      } else {
        await createBankTransfer.mutateAsync(input);
      }

      setDialogOpen(false);
      setEditing(undefined);
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ??
          'Nao foi possivel salvar a transferencia.',
      );
    }
  };

  const columns: GridColDef<BankTransfer>[] = [
    {
      field: 'sourceBankAccount',
      headerName: 'Conta Origem',
      flex: 1,
      minWidth: 170,
      valueGetter: (_, row) =>
        selectBankAccountLabelById(catalog, row.sourceBankAccountId),
    },
    {
      field: 'destinationBankAccount',
      headerName: 'Conta Destino',
      flex: 1,
      minWidth: 170,
      valueGetter: (_, row) =>
        selectBankAccountLabelById(catalog, row.destinationBankAccountId),
    },
    {
      field: 'transferDate',
      headerName: 'Data',
      flex: 0.7,
      minWidth: 120,
      valueFormatter: (value) => fmtDate(value as string),
    },
    {
      field: 'observation',
      headerName: 'Observacao',
      flex: 1.2,
      minWidth: 180,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'amount',
      headerName: 'Valor',
      type: 'number',
      flex: 0.7,
      minWidth: 130,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => fmtBRL((value as number | undefined) ?? 0),
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={700} color="info.main">
          {fmtBRL(row.amount)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acoes',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: ({ row }) => (
        <RowActions
          onEdit={() => {
            setEditing(row);
            setDialogOpen(true);
          }}
          onDelete={() => {
            void deleteBankTransfer.mutateAsync(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Transferencia"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <AppDataGrid
        rows={sorted}
        columns={columns}
        emptyMessage="Nenhuma transferencia encontrada."
        exportFileName="transferencias-bancarias"
      />

      <BankTransferDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        activeBankAccounts={activeBankAccounts}
        saving={createBankTransfer.isPending || updateBankTransfer.isPending}
        onSave={(input) => {
          void handleSave(input);
        }}
      />
    </Box>
  );
}
