import { useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import type {
  ChartOfAccount,
  ChartOfAccountInput,
} from '../../../domains/accounting/model/entities';
import {
  useAccountingCatalogData,
  useAccountingMutations,
} from '../../../domains/accounting/ui/hooks';
import { ChartDialog } from './ChartDialog';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { TreeNode } from '../shared/TreeNode';

const TYPE_COLOR: Record<
  ChartOfAccount['type'],
  'success' | 'error' | 'warning' | 'default'
> = {
  INCOME: 'success',
  EXPENSE: 'error',
  TRANSFER: 'warning',
  MANAGERIAL: 'default',
};

const TYPE_LABEL: Record<ChartOfAccount['type'], string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  TRANSFER: 'Transferencia',
  MANAGERIAL: 'Gerencial',
};

export function ChartOfAccountsTab() {
  const { chartOfAccounts, isLoading } = useAccountingCatalogData();
  const {
    createChartOfAccount,
    updateChartOfAccount,
    deleteChartOfAccount,
  } = useAccountingMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChartOfAccount | undefined>();
  const [parentForNew, setParentForNew] = useState<number | undefined>();

  const roots = chartOfAccounts.filter((chartOfAccount) => !chartOfAccount.parentId);

  const getChartOfAccountName = (chartOfAccountId?: number) =>
    chartOfAccounts.find((chartOfAccount) => chartOfAccount.id === chartOfAccountId)
      ?.name;

  const handleSave = async (input: ChartOfAccountInput) => {
    if (editing) {
      await updateChartOfAccount.mutateAsync({ id: editing.id, input });
    } else {
      await createChartOfAccount.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async (chartOfAccount: ChartOfAccount) => {
    if (
      chartOfAccounts.some(
        (candidate) => candidate.parentId === chartOfAccount.id,
      )
    ) {
      alert('Remova as subcontas antes de excluir.');
      return;
    }

    await deleteChartOfAccount.mutateAsync(chartOfAccount.id);
  };

  const openCreate = () => {
    setEditing(undefined);
    setParentForNew(undefined);
    setDialogOpen(true);
  };

  const openEdit = (chartOfAccount: ChartOfAccount) => {
    setEditing(chartOfAccount);
    setParentForNew(undefined);
    setDialogOpen(true);
  };

  const openChild = (chartOfAccount: ChartOfAccount) => {
    setEditing(undefined);
    setParentForNew(chartOfAccount.id);
    setDialogOpen(true);
  };

  return (
    <Box>
      <PageHeader actionLabel="Nova Conta Raiz" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Lancamentos</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roots.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                allNodes={chartOfAccounts}
                depth={0}
                onEdit={openEdit}
                onDelete={(node) => {
                  void handleDelete(node);
                }}
                onAddChild={openChild}
                getParentId={(item) => item.parentId}
                renderExtraCells={(node) => (
                  <>
                    <TableCell>
                      <Chip
                        label={TYPE_LABEL[node.type]}
                        size="small"
                        color={TYPE_COLOR[node.type]}
                        sx={{ height: 18, fontSize: '0.68rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={node.acceptsTransaction ? 'Sim' : 'Nao'}
                        size="small"
                        color={node.acceptsTransaction ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.68rem' }}
                      />
                    </TableCell>
                  </>
                )}
              />
            ))}
            {roots.length === 0 && (
              <EmptyTableRow
                colSpan={4}
                message={
                  isLoading
                    ? 'Carregando plano de contas...'
                    : 'Nenhuma conta contabil cadastrada.'
                }
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <ChartDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        parentId={parentForNew}
        parentName={getChartOfAccountName(parentForNew)}
        onSave={handleSave}
        saving={createChartOfAccount.isPending || updateChartOfAccount.isPending}
      />
    </Box>
  );
}
