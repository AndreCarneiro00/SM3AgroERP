import type { Dispatch, SetStateAction } from 'react';
import { TextField } from '@mui/material';
import type {
  IncomeStatementGroup,
  IncomeStatementGroupInput,
} from '../../../domains/accounting/model/entities';
import {
  useAccountingCatalogData,
  useAccountingMutations,
} from '../../../domains/accounting/ui/hooks';
import { SimpleListTab } from '../master/SimpleListTab';

export function DREGroupsTab() {
  const { incomeStatementGroups, isLoading } = useAccountingCatalogData();
  const {
    createIncomeStatementGroup,
    updateIncomeStatementGroup,
    deleteIncomeStatementGroup,
  } = useAccountingMutations();
  const saving =
    createIncomeStatementGroup.isPending ||
    updateIncomeStatementGroup.isPending ||
    deleteIncomeStatementGroup.isPending;

  const ExtraFields = ({
    form,
    setForm,
  }: {
    form: Partial<IncomeStatementGroup>;
    setForm: Dispatch<SetStateAction<Partial<IncomeStatementGroup>>>;
  }) => (
    <TextField
      label="Ordem de Exibicao"
      type="number"
      value={String(form.displayOrder ?? '')}
      onChange={(event) =>
        setForm((current) => ({
          ...current,
          displayOrder: event.target.value
            ? Number(event.target.value)
            : undefined,
        }))
      }
      fullWidth
    />
  );

  const handleSave = async (
    editing: IncomeStatementGroup | undefined,
    form: Partial<IncomeStatementGroup>,
  ) => {
    const input: IncomeStatementGroupInput = {
      name: String(form.name ?? '').trim(),
      displayOrder:
        typeof form.displayOrder === 'number'
          ? form.displayOrder
          : form.displayOrder
            ? Number(form.displayOrder)
            : undefined,
    };

    if (editing) {
      await updateIncomeStatementGroup.mutateAsync({ id: editing.id, input });
    } else {
      await createIncomeStatementGroup.mutateAsync(input);
    }
  };

  return (
    <SimpleListTab<IncomeStatementGroup>
      items={incomeStatementGroups}
      entityLabel="Grupo DRE"
      onSave={handleSave}
      onDelete={(group) => deleteIncomeStatementGroup.mutateAsync(group.id)}
      extraColumns={[
        {
          key: 'displayOrder',
          label: 'Ordem',
          render: (group) => group.displayOrder ?? '-',
        },
      ]}
      ExtraFields={ExtraFields}
      createInitial={() => ({ displayOrder: undefined })}
      saving={saving}
      isLoading={isLoading}
      emptyMessage="Nenhum grupo DRE cadastrado."
    />
  );
}
