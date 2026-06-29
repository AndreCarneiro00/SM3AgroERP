import { useState } from 'react';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type {
  IncomeStatementRelationship,
  IncomeStatementRelationshipInput,
  IncomeStatementRelationshipRow,
} from '../../../domains/accounting/model/entities';
import {
  selectChartOfAccountDisplayName,
} from '../../../domains/accounting/selectors/selectors';
import {
  useAccountingCatalogData,
  useAccountingMutations,
} from '../../../domains/accounting/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';

export function IncomeStatementRelationshipsTab() {
  const {
    incomeStatementRelationshipRows,
    incomeStatementGroups,
    postableChartOfAccounts,
    isLoading,
  } = useAccountingCatalogData();
  const {
    createIncomeStatementRelationship,
    updateIncomeStatementRelationship,
    deleteIncomeStatementRelationship,
  } = useAccountingMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<
    IncomeStatementRelationshipRow | undefined
  >();
  const [form, setForm] = useState<Partial<IncomeStatementRelationship>>({});

  const saving =
    createIncomeStatementRelationship.isPending ||
    updateIncomeStatementRelationship.isPending ||
    deleteIncomeStatementRelationship.isPending;

  const openCreate = () => {
    setEditing(undefined);
    setForm({});
    setDialogOpen(true);
  };

  const openEdit = (relationship: IncomeStatementRelationshipRow) => {
    setEditing(relationship);
    setForm({
      chartOfAccountId: relationship.chartOfAccountId,
      incomeStatementGroupId: relationship.incomeStatementGroupId,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const input: IncomeStatementRelationshipInput = {
      chartOfAccountId: form.chartOfAccountId,
      incomeStatementGroupId: form.incomeStatementGroupId,
    };

    if (editing) {
      await updateIncomeStatementRelationship.mutateAsync({
        id: editing.id,
        input,
      });
    } else {
      await createIncomeStatementRelationship.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  return (
    <>
      <PageHeader
        actionLabel="Novo Relacionamento DRE"
        onAction={openCreate}
      />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Conta Contabil</TableCell>
              <TableCell>Grupo DRE</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomeStatementRelationshipRows.map((relationship) => (
              <TableRow key={relationship.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {relationship.chartOfAccountName}
                  </Typography>
                </TableCell>
                <TableCell>{relationship.incomeStatementGroupName}</TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => openEdit(relationship)}
                    onDelete={() => {
                      void deleteIncomeStatementRelationship.mutateAsync(
                        relationship.id,
                      );
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {incomeStatementRelationshipRows.length === 0 && (
              <EmptyTableRow
                colSpan={3}
                message={
                  isLoading
                    ? 'Carregando relacionamentos DRE...'
                    : 'Nenhum relacionamento DRE cadastrado.'
                }
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editing ? 'Editar Relacionamento DRE' : 'Novo Relacionamento DRE'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Conta Contabil</InputLabel>
              <Select
                value={String(form.chartOfAccountId ?? '')}
                label="Conta Contabil"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    chartOfAccountId: Number(event.target.value),
                  }))
                }
              >
                {postableChartOfAccounts.map((chartOfAccount) => (
                  <MenuItem
                    key={chartOfAccount.id}
                    value={String(chartOfAccount.id)}
                  >
                    {selectChartOfAccountDisplayName(chartOfAccount)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Grupo DRE</InputLabel>
              <Select
                value={String(form.incomeStatementGroupId ?? '')}
                label="Grupo DRE"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    incomeStatementGroupId: Number(event.target.value),
                  }))
                }
              >
                {incomeStatementGroups.map((group) => (
                  <MenuItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!form.chartOfAccountId || !form.incomeStatementGroupId || saving}
            onClick={() => {
              void handleSave();
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
