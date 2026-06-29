import { useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
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
import { EmptyTableRow } from '../shared/EmptyTableRow';
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
    if (editing) {
      await updateBankTransfer.mutateAsync({ id: editing.id, input });
    } else {
      await createBankTransfer.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Transferencia"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta Origem</TableCell>
              <TableCell>Conta Destino</TableCell>
              <TableCell>Data</TableCell>
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
                    onEdit={() => {
                      setEditing(bankTransfer);
                      setDialogOpen(true);
                    }}
                    onDelete={() => {
                      void deleteBankTransfer.mutateAsync(bankTransfer.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <EmptyTableRow
                colSpan={6}
                message="Nenhuma transferencia encontrada."
              />
            )}
          </TableBody>
        </Table>
      </Card>

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
