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
  Typography,
} from '@mui/material';
import type {
  CostCenter,
  CostCenterInput,
} from '../../../domains/accounting/model/entities';
import {
  useAccountingCatalogData,
  useAccountingMutations,
} from '../../../domains/accounting/ui/hooks';
import {
  selectActivityGroupLabelById,
} from '../../../domains/master-data/selectors/selectors';
import { useMasterDataCatalogData } from '../../../domains/master-data/ui/hooks';
import { CostCenterDialog } from './CostCenterDialog';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { TreeNode } from '../shared/TreeNode';

export function CostCentersTab() {
  const { costCenters, isLoading } = useAccountingCatalogData();
  const { createCostCenter, updateCostCenter, deleteCostCenter } =
    useAccountingMutations();
  const { activityGroups, catalog } = useMasterDataCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenter | undefined>();
  const [parentForNew, setParentForNew] = useState<number | undefined>();

  const roots = costCenters.filter((costCenter) => !costCenter.parentId);

  const getActivityGroupName = (activityGroupId?: number) =>
    selectActivityGroupLabelById(catalog, activityGroupId);

  const getCostCenterName = (costCenterId?: number) =>
    costCenters.find((costCenter) => costCenter.id === costCenterId)?.name;

  const handleSave = async (input: CostCenterInput) => {
    if (editing) {
      await updateCostCenter.mutateAsync({ id: editing.id, input });
    } else {
      await createCostCenter.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async (costCenter: CostCenter) => {
    if (costCenters.some((candidate) => candidate.parentId === costCenter.id)) {
      alert('Remova os sub-centros antes de excluir.');
      return;
    }

    await deleteCostCenter.mutateAsync(costCenter.id);
  };

  const openCreate = () => {
    setEditing(undefined);
    setParentForNew(undefined);
    setDialogOpen(true);
  };

  const openEdit = (costCenter: CostCenter) => {
    setEditing(costCenter);
    setParentForNew(undefined);
    setDialogOpen(true);
  };

  const openChild = (costCenter: CostCenter) => {
    setEditing(undefined);
    setParentForNew(costCenter.id);
    setDialogOpen(true);
  };

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
              <TableCell>Lancamentos</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roots.map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                allNodes={costCenters}
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
                      {node.type && (
                        <Chip
                          label={node.type}
                          size="small"
                          color={node.type === 'CAPEX' ? 'warning' : 'info'}
                          sx={{ height: 18, fontSize: '0.68rem' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {getActivityGroupName(node.activityGroupId)}
                      </Typography>
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
                colSpan={5}
                message={
                  isLoading
                    ? 'Carregando centros de custo...'
                    : 'Nenhum centro de custo cadastrado.'
                }
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <CostCenterDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        parentId={parentForNew}
        parentName={getCostCenterName(parentForNew)}
        activityGroups={activityGroups}
        onSave={handleSave}
        saving={createCostCenter.isPending || updateCostCenter.isPending}
      />
    </Box>
  );
}
