import { useState } from 'react';
import {
  Box,
  Chip,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import {
  selectBankAccountLabelById,
} from '../../../domains/banking/selectors/selectors';
import { useBankAccountsData } from '../../../domains/banking/ui/hooks';
import type {
  BankTransfer,
  BankTransferInput,
} from '../../../domains/financial/model/entities';
import {
  buildFinancialDateRange,
  getCurrentYearDateRange,
} from '../../../domains/financial/model/dateRange';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import { extractApiErrorMessage } from '../../../core/http/client';
import { todayIsoDate } from '../../forms/valueParsers';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { ResponsiveTableFrame } from '../shared/table';
import { BankTransferDialog } from './BankTransferDialog';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');

const CASH_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativa',
  CANCELED: 'Cancelada',
  ADJUSTMENT: 'Ajuste',
};

export function BankTransfersTab() {
  const { activeBankAccounts, catalog } = useBankAccountsData();
  const [periodStart, setPeriodStart] = useState(
    () => getCurrentYearDateRange().startDate,
  );
  const [periodEnd, setPeriodEnd] = useState(
    () => getCurrentYearDateRange().endDate,
  );
  const bankTransfersDateRange = buildFinancialDateRange(
    periodStart,
    periodEnd,
  );
  const { bankTransfers } = useFinancialCatalogData({
    bankTransfers: bankTransfersDateRange,
  });
  const {
    createBankTransfer,
    updateBankTransfer,
    cancelBankTransfer,
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

  const handleCancel = async (bankTransfer: BankTransfer) => {
    const adjustmentDate = window.prompt(
      'Data do ajuste de cancelamento',
      todayIsoDate(),
    );

    if (!adjustmentDate) {
      return;
    }

    try {
      await cancelBankTransfer.mutateAsync({
        id: bankTransfer.id,
        input: {
          adjustmentDate,
          observation: `Cancelamento da transferencia ${bankTransfer.id}`,
        },
      });
    } catch (error) {
      window.alert(
        extractApiErrorMessage(error) ??
          'Nao foi possivel cancelar a transferencia.',
      );
    }
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Transferencia"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <TextField
          label="Inicio"
          type="date"
          size="small"
          value={periodStart}
          onChange={(event) => setPeriodStart(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 145 }}
        />

        <TextField
          label="Fim"
          type="date"
          size="small"
          value={periodEnd}
          onChange={(event) => setPeriodEnd(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 145 }}
        />
      </PageHeader>

      <ResponsiveTableFrame minWidth={1180} maxHeight="calc(115vh - 260px)">
        <TableHead>
          <TableRow>
            <TableCell>Conta Origem</TableCell>
            <TableCell>Conta Destino</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Observacao</TableCell>
            <TableCell align="right">Valor</TableCell>
            <TableCell align="center">Acoes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((bankTransfer) => (
            <TableRow key={bankTransfer.id}>
              <TableCell>
                {selectBankAccountLabelById(
                  catalog,
                  bankTransfer.sourceBankAccountId,
                )}
              </TableCell>
              <TableCell>
                {selectBankAccountLabelById(
                  catalog,
                  bankTransfer.destinationBankAccountId,
                )}
              </TableCell>
              <TableCell>{fmtDate(bankTransfer.transferDate)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={CASH_STATUS_LABEL[bankTransfer.status] ?? bankTransfer.status}
                  color={
                    bankTransfer.status === 'ACTIVE'
                      ? 'success'
                      : bankTransfer.status === 'ADJUSTMENT'
                        ? 'info'
                        : 'default'
                  }
                  sx={{ height: 20 }}
                />
                {bankTransfer.cancelId && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    ref. #{bankTransfer.cancelId}
                  </Typography>
                )}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>
                {bankTransfer.observation ?? '-'}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={700} color="info.main">
                  {fmtBRL(bankTransfer.amount)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <RowActions
                  disabled={bankTransfer.status !== 'ACTIVE'}
                  onEdit={() => {
                    setEditing(bankTransfer);
                    setDialogOpen(true);
                  }}
                  onDelete={() => {
                    void handleCancel(bankTransfer);
                  }}
                  deleteConfirmMessage="Cancelar esta transferencia por ajuste?"
                  deleteTooltip="Cancelar por ajuste"
                  deleteColor="warning"
                  deleteIcon={<UndoIcon sx={{ fontSize: 16 }} />}
                />
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <EmptyTableRow
              colSpan={7}
              message="Nenhuma transferencia encontrada."
            />
          )}
        </TableBody>
      </ResponsiveTableFrame>

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
