import {
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import { CrudTable } from '../shared/CrudTable';
import type { FinancialTransactionItem } from '../../data/types';

const fmtBRL = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function TransactionItemsTab() {
  const {
    financialTransactionItems,
    setFinancialTransactionItems,
    financialTransactions,
    chartOfAccounts,
    costCenters,
    products,
    nextId,
  } = useApp();

  return (
    <CrudTable<FinancialTransactionItem>
      items={financialTransactionItems}
      setItems={setFinancialTransactionItems}
      nextId={nextId}
      actionLabel="Novo Item Financeiro"
      dialogTitle={(editing) => editing ? 'Editar Item Financeiro' : 'Novo Item Financeiro'}
      createInitial={() => ({})}
      columns={[
        {
          label: 'Transação',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {financialTransactions.find((transaction) => transaction.id === item.financial_transaction_id)?.description ?? '-'}
            </Typography>
          ),
        },
        { label: 'Conta', render: (item) => chartOfAccounts.find((account) => account.id === item.chart_of_account_id)?.name ?? '-' },
        { label: 'Centro de Custo', render: (item) => costCenters.find((center) => center.id === item.cost_center_id)?.name ?? '-' },
        { label: 'Produto', render: (item) => products.find((product) => product.id === item.product_id)?.name ?? '-' },
        { label: 'Quantidade', align: 'right', render: (item) => item.quantity?.toLocaleString('pt-BR') ?? '-' },
        { label: 'Preço Unit.', align: 'right', render: (item) => item.unit_price ? fmtBRL(item.unit_price) : '-' },
        { label: 'Valor', align: 'right', render: (item) => item.amount ? fmtBRL(item.amount) : '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Transação</InputLabel>
            <Select
              value={String(form.financial_transaction_id ?? '')}
              label="Transação"
              onChange={(event) => setForm((current) => ({ ...current, financial_transaction_id: Number(event.target.value) }))}
            >
              {financialTransactions.map((transaction) => (
                <MenuItem key={transaction.id} value={String(transaction.id)}>{transaction.description}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Conta Contábil</InputLabel>
              <Select
                value={String(form.chart_of_account_id ?? '')}
                label="Conta Contábil"
                onChange={(event) => setForm((current) => ({ ...current, chart_of_account_id: Number(event.target.value) }))}
              >
                {chartOfAccounts.filter((account) => account.accepts_transaction).map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>{account.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Centro de Custo</InputLabel>
              <Select
                value={String(form.cost_center_id ?? '')}
                label="Centro de Custo"
                onChange={(event) => setForm((current) => ({ ...current, cost_center_id: event.target.value ? Number(event.target.value) : undefined }))}
              >
                <MenuItem value="">— Nenhum —</MenuItem>
                {costCenters.map((center) => (
                  <MenuItem key={center.id} value={String(center.id)}>{center.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Produto</InputLabel>
              <Select
                value={String(form.product_id ?? '')}
                label="Produto"
                onChange={(event) => setForm((current) => ({ ...current, product_id: event.target.value ? Number(event.target.value) : undefined }))}
              >
                <MenuItem value="">— Nenhum —</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>{product.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantidade"
              type="number"
              value={String(form.quantity ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Preço Unitário"
              type="number"
              value={String(form.unit_price ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, unit_price: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
            <TextField
              label="Valor"
              type="number"
              value={String(form.amount ?? '')}
              onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value ? Number(event.target.value) : undefined }))}
              fullWidth
            />
          </Stack>
        </>
      )}
      isSaveDisabled={(form) => !form.financial_transaction_id || !form.chart_of_account_id || !form.amount}
      emptyMessage="Nenhum item financeiro cadastrado."
    />
  );
}
