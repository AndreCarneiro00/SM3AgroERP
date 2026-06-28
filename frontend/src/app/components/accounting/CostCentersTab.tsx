import { useState } from 'react';
import { Box, Card, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { CostCenter } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { TreeNode } from '../shared/TreeNode';
import { CostCenterDialog } from './CostCenterDialog';

export function CostCentersTab() {
  const { costCenters, setCostCenters, activityGroups, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | undefined>();
  const [parentForNew, setParentForNew] = useState<number | undefined>();

  const roots = costCenters.filter(c => !c.parent_id);

  const handleSave = (d: Partial<CostCenter>) => {
    setCostCenters(cs =>
      editing
        ? cs.map(c => c.id === editing.id ? { ...editing, ...d } : c)
        : [...cs, { id: nextId(cs), active: true, ...d } as CostCenter]
    );
    setDialogOpen(false);
  };

  const handleDelete = (node: CostCenter) => {
    if (costCenters.some(c => c.parent_id === node.id)) {
      alert('Remova os sub-centros antes de excluir.');
      return;
    }
    setCostCenters(cs => cs.filter(c => c.id !== node.id));
  };

  const openCreate = () => { setEditing(undefined); setParentForNew(undefined); setDialogOpen(true); };
  const openEdit = (n: CostCenter) => { setEditing(n); setParentForNew(undefined); setDialogOpen(true); };
  const openChild = (n: CostCenter) => { setEditing(undefined); setParentForNew(n.id); setDialogOpen(true); };

  return (
    <Box>
      <PageHeader actionLabel="Novo Centro Raiz" onAction={openCreate} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Centro de Custo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Grupo Atividade</TableCell>
              <TableCell>Lançamentos</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roots.map(root => (
              <TreeNode
                key={root.id}
                node={root}
                allNodes={costCenters}
                depth={0}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddChild={openChild}
                renderExtraCells={n => (
                  <>
                    <TableCell>
                      {n.type && (
                        <Chip label={n.type} size="small"
                          color={n.type === 'CAPEX' ? 'warning' : 'info'}
                          sx={{ height: 18, fontSize: '0.68rem' }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {activityGroups.find(ag => ag.id === n.activity_group_id)?.name ?? '-'}
                      </Typography>
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

      <CostCenterDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        editing={editing} parentId={parentForNew} onSave={handleSave} />
    </Box>
  );
}
