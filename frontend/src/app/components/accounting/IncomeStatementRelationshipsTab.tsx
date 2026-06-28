import {
  FormControl, InputLabel, MenuItem, Select, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { IncomeStatementRelationship } from '../../data/types';

export function IncomeStatementRelationshipsTab() {
  const {
    incomeStatementRelationships,
    setIncomeStatementRelationships,
    chartOfAccounts,
    incomeStatementGroups,
    nextId,
  } = useApp();

  const selectableAccounts = chartOfAccounts.filter((account) => account.accepts_transaction);

  return (
    <CrudTable<IncomeStatementRelationship>
      items={incomeStatementRelationships}
      setItems={setIncomeStatementRelationships}
      nextId={nextId}
      actionLabel="Novo Relacionamento DRE"
      dialogTitle={(editing) => editing ? 'Editar Relacionamento DRE' : 'Novo Relacionamento DRE'}
      createInitial={() => ({})}
      columns={[
        {
          label: 'Conta Contábil',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {chartOfAccounts.find((account) => account.id === item.chart_of_account_id)?.name ?? '-'}
            </Typography>
          ),
        },
        {
          label: 'Grupo DRE',
          render: (item) => incomeStatementGroups.find((group) => group.id === item.income_statement_group_id)?.name ?? '-',
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Conta Contábil</InputLabel>
            <Select
              value={String(form.chart_of_account_id ?? '')}
              label="Conta Contábil"
              onChange={(event) => setForm((current) => ({ ...current, chart_of_account_id: Number(event.target.value) }))}
            >
              {selectableAccounts.map((account) => (
                <MenuItem key={account.id} value={String(account.id)}>
                  {account.code ? `${account.code} • ` : ''}{account.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Grupo DRE</InputLabel>
            <Select
              value={String(form.income_statement_group_id ?? '')}
              label="Grupo DRE"
              onChange={(event) => setForm((current) => ({ ...current, income_statement_group_id: Number(event.target.value) }))}
            >
              {incomeStatementGroups.map((group) => (
                <MenuItem key={group.id} value={String(group.id)}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
      isSaveDisabled={(form) => !form.chart_of_account_id || !form.income_statement_group_id}
      emptyMessage="Nenhum relacionamento DRE cadastrado."
    />
  );
}
