import { useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import type { GridColDef } from '@mui/x-data-grid';
import type {
  BankAccount,
  BankAccountInput,
} from '../../../domains/banking/model/entities';
import {
  useBankAccountsData,
  useBankAccountsMutations,
} from '../../../domains/banking/ui/hooks';
import { useFinancialCatalogData } from '../../../domains/financial/ui/hooks';
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { BankAccountDialog } from './BankAccountDialog';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

const BANK_COLORS: Record<string, string> = {
  'Banco do Brasil': '#F9D71C',
  Sicoob: '#004A9F',
  'Caixa Economica Federal': '#0066B3',
  Bradesco: '#CC092F',
  Itau: '#F77F00',
  Santander: '#EC0000',
  Nubank: '#820AD1',
};

function BankCard({
  bankAccount,
  paymentsCount,
  transfersCount,
  onEdit,
  onDelete,
}: {
  bankAccount: BankAccount;
  paymentsCount: number;
  transfersCount: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color =
    BANK_COLORS[bankAccount.financialInstitution ?? ''] ?? '#2E7D32';

  return (
    <Card sx={{ width: 280, opacity: bankAccount.active ? 1 : 0.6 }}>
      <Box sx={{ height: 6, bgcolor: color, borderRadius: '8px 8px 0 0' }} />
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: `${color}22`, color, width: 36, height: 36 }}>
              <AccountBalanceIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ lineHeight: 1.3 }}
              >
                {bankAccount.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bankAccount.financialInstitution}
              </Typography>
            </Box>
          </Stack>
          {!bankAccount.active && (
            <Chip
              label="Inativa"
              size="small"
              color="default"
              sx={{ height: 18, fontSize: '0.66rem' }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={2} mb={1.5}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Agencia
            </Typography>
            <Typography variant="body2">{bankAccount.agency ?? '-'}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Conta
            </Typography>
            <Typography variant="body2">
              {bankAccount.accountNumber ?? '-'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tipo
            </Typography>
            <Typography variant="body2">
              {bankAccount.accountType ?? '-'}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Saldo Atual
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {fmtBRL(bankAccount.currentBalance ?? bankAccount.initialBalance ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Inicial {fmtBRL(bankAccount.initialBalance ?? 0)} em{' '}
              {fmtDate(bankAccount.initialBalanceDate)}
            </Typography>
          </Box>
          <RowActions onEdit={onEdit} onDelete={onDelete} />
        </Stack>

        <Stack direction="row" spacing={1} mt={1}>
          <Chip
            label={`${paymentsCount} pgtos`}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.66rem' }}
          />
          <Chip
            label={`${transfersCount} transf.`}
            size="small"
            variant="outlined"
            sx={{ height: 18, fontSize: '0.66rem' }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

export function BankingModule() {
  const {
    financialTransactionFulfillments: fulfillments,
    bankTransfers,
  } = useFinancialCatalogData();
  const { bankAccounts, totalActiveBalance, isLoading } = useBankAccountsData();
  const {
    createBankAccount,
    deleteBankAccount,
    updateBankAccount,
  } = useBankAccountsMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | undefined>();

  const handleSave = async (input: BankAccountInput) => {
    if (editing) {
      await updateBankAccount.mutateAsync({ id: editing.id, input });
    } else {
      await createBankAccount.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async (bankAccountId: number) => {
    if (
      fulfillments.some((fulfillment) => fulfillment.bankAccountId === bankAccountId)
    ) {
      alert('Esta conta possui pagamentos vinculados e nao pode ser excluida.');
      return;
    }

    if (
      bankTransfers.some(
        (transfer) =>
          transfer.sourceBankAccountId === bankAccountId ||
          transfer.destinationBankAccountId === bankAccountId,
      )
    ) {
      alert('Esta conta possui transferencias vinculadas e nao pode ser excluida.');
      return;
    }

    await deleteBankAccount.mutateAsync(bankAccountId);
  };

  const saving = createBankAccount.isPending || updateBankAccount.isPending;

  const columns: GridColDef<BankAccount>[] = [
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
      minWidth: 170,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={500}>
          {row.name}
        </Typography>
      ),
    },
    {
      field: 'financialInstitution',
      headerName: 'Instituicao',
      flex: 1,
      minWidth: 160,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'accountType',
      headerName: 'Tipo',
      flex: 0.8,
      minWidth: 120,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'agency',
      headerName: 'Agencia',
      flex: 0.7,
      minWidth: 110,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'accountNumber',
      headerName: 'Conta',
      flex: 0.8,
      minWidth: 130,
      valueFormatter: (value) => value ?? '-',
    },
    {
      field: 'active',
      headerName: 'Status',
      flex: 0.7,
      minWidth: 110,
      valueFormatter: (value) => (value ? 'Ativa' : 'Inativa'),
      renderCell: ({ row }) => (
        <Chip
          label={row.active ? 'Ativa' : 'Inativa'}
          size="small"
          color={row.active ? 'success' : 'default'}
          sx={{ height: 20 }}
        />
      ),
    },
    {
      field: 'currentBalance',
      headerName: 'Saldo Atual',
      type: 'number',
      flex: 0.8,
      minWidth: 140,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (_, row) => row.currentBalance ?? row.initialBalance ?? 0,
      valueFormatter: (value) => fmtBRL((value as number | undefined) ?? 0),
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {fmtBRL(row.currentBalance ?? row.initialBalance ?? 0)}
        </Typography>
      ),
    },
    {
      field: 'initialBalance',
      headerName: 'Saldo Inicial',
      type: 'number',
      flex: 0.8,
      minWidth: 140,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) => fmtBRL((value as number | undefined) ?? 0),
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          {fmtBRL(row.initialBalance ?? 0)}
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
            void handleDelete(row.id);
          }}
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Conta"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1,
            bgcolor: '#E3F2FD',
            borderRadius: 1,
            borderLeft: '4px solid #1565C0',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Saldo Total (contas ativas)
          </Typography>
          <Typography variant="h5" color="primary.dark" fontWeight={700}>
            {fmtBRL(totalActiveBalance)}
          </Typography>
        </Box>
      </PageHeader>

      <Stack direction="row" flexWrap="wrap" gap={2} mb={2.5}>
        {bankAccounts.map((bankAccount) => {
          const paymentsCount = fulfillments.filter(
            (fulfillment) => fulfillment.bankAccountId === bankAccount.id,
          ).length;
          const transfersCount = bankTransfers.filter(
            (transfer) =>
              transfer.sourceBankAccountId === bankAccount.id ||
              transfer.destinationBankAccountId === bankAccount.id,
          ).length;

          return (
            <BankCard
              key={bankAccount.id}
              bankAccount={bankAccount}
              paymentsCount={paymentsCount}
              transfersCount={transfersCount}
              onEdit={() => {
                setEditing(bankAccount);
                setDialogOpen(true);
              }}
              onDelete={() => {
                void handleDelete(bankAccount.id);
              }}
            />
          );
        })}
      </Stack>

      <AppDataGrid
        rows={bankAccounts}
        columns={columns}
        loading={isLoading}
        emptyMessage="Nenhuma conta bancaria cadastrada."
        exportFileName="contas-bancarias"
      />

      <BankAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
