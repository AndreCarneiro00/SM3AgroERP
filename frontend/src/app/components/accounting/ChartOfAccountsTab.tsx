import { useState } from 'react';
import { Box, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { ChartOfAccount } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { TreeNode } from '../shared/TreeNode';
import { ChartDialog } from './ChartDialog';

const TYPE_COLOR: Record<string, 'success' | 'error' | 'warning' | 'default'> = {
  INCOME: 'success', EXPENSE: 'error', TRANSFER: 'warning', MANAGERIAL: 'default',
};
const TYPE_LABEL: Record<string, string> = {
  INCOME: 'Receita', EXPENSE: 'Despesa', TRANSFER: 'Transferência', MANAGERIAL: 'Gerencial',
};

export function ChartOfAccountsTab() {
  const { chartOfAccounts, setChartOfAccounts, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChartOfAccount | undefined>();
  const [parentForNew, setParentForNew] = useState<number | undefined>();

  const roots = chartOfAccounts.filter(c => !c.parent_id);

  const handleSave = (d: Partial<ChartOfAccount>) => {
    setChartOfAccounts(cs =>
      editing
        ? cs.map(c => c.id === editing.id ? { ...editing, ...d } : c)
        : [...cs, { id: nextId(cs), active: true, ...d } as ChartOfAccount]
    );
    setDialogOpen(false);
  };

  const handleDelete = (node: ChartOfAccount) => {
    if (chartOfAccounts.some(c => c.parent_id === node.id)) {
      alert('Remova as subcontas antes de excluir.');
      return;
    }
    setChartOfAccounts(cs => cs.filter(c => c.id !== node.id));
  };

  const openCreate = () => { setEditing(undefined); setParentForNew(undefined); setDialogOpen(true); };
  const openEdit = (n: ChartOfAccount) => { setEditing(n); setParentForNew(undefined); setDialogOpen(true); };
  const openChild = (n: ChartOfAccount) => { setEditing(undefined); setParentForNew(n.id); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader actionLabel="Nova Conta Raiz" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Lançamentos</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roots.map(root => (
              <TreeNode
                key={root.id}
                node={root}
                allNodes={chartOfAccounts}
                depth={0}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddChild={openChild}
                renderExtraCells={n => (
                  <>
                    <TableCell>
                      <Chip label={TYPE_LABEL[n.type]} size="small" color={TYPE_COLOR[n.type]}
                        sx={{ height: 18, fontSize: '0.68rem' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={n.accepts_transaction ? 'Sim' : 'Não'} size="small"
                        color={n.accepts_transaction ? 'success' : 'default'} variant="outlined"
                        sx={{ height: 18, fontSize: '0.68rem' }} />
                    </TableCell>
                  </>
                )}
              />
            ))}
          </TableBody>
        </Table>
      </Card>

      <ChartDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        editing={editing} parentId={parentForNew} onSave={handleSave} />
    </Box>
  );
}
