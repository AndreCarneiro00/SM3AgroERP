import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  selectChartOfAccountDisplayName,
  selectChartOfAccountLabelById,
  selectCostCenterDisplayName,
  selectCostCenterLabelById,
} from '../../../domains/accounting/selectors/selectors';
import { useAccountingCatalogData } from '../../../domains/accounting/ui/hooks';
import type {
  FinancialTransactionItem,
  FinancialTransactionItemInput,
} from '../../../domains/financial/model/entities';
import {
  selectFinancialTransactionLabelById,
} from '../../../domains/financial/selectors/selectors';
import {
  useFinancialCatalogData,
  useFinancialMutations,
} from '../../../domains/financial/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function toFinancialTransactionItemInput(
  form: Partial<FinancialTransactionItem>,
): FinancialTransactionItemInput {
  return {
    financialTransactionId: form.financialTransactionId,
    chartOfAccountId: form.chartOfAccountId,
    costCenterId: form.costCenterId,
    quantity: form.quantity,
    unitPrice: form.unitPrice,
    amount: form.amount,
    productId: form.productId,
  };
}

export function TransactionItemsTab() {
  const {
    catalog: financialCatalog,
    financialTransactionItems,
    financialTransactions,
  } = useFinancialCatalogData();
  const {
    createFinancialTransactionItem,
    updateFinancialTransactionItem,
    deleteFinancialTransactionItem,
  } = useFinancialMutations();
  const {
    catalog: accountingCatalog,
    postableChartOfAccounts,
    postableCostCenters,
  } = useAccountingCatalogData();
  const { catalog: productsCatalog, products } = useProductsCatalogData();

  const getProductName = (productId?: number) =>
    productsCatalog.products.byId[productId ?? -1]?.name ?? '-';

  return (
    <CrudTable<FinancialTransactionItem>
      items={financialTransactionItems}
      onCreate={(input) =>
        createFinancialTransactionItem.mutateAsync(
          toFinancialTransactionItemInput(input),
        )
      }
      onUpdate={({ id, input }) =>
        updateFinancialTransactionItem.mutateAsync({
          id,
          input: toFinancialTransactionItemInput(input),
        })
      }
      onDelete={(id) => deleteFinancialTransactionItem.mutateAsync(id)}
      actionLabel="Novo Item Financeiro"
      dialogTitle={(editing) =>
        editing ? 'Editar Item Financeiro' : 'Novo Item Financeiro'
      }
      createInitial={() => ({})}
      columns={[
        {
          label: 'Transacao',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {selectFinancialTransactionLabelById(
                financialCatalog,
                item.financialTransactionId,
              )}
            </Typography>
          ),
        },
        {
          label: 'Conta',
          render: (item) =>
            selectChartOfAccountLabelById(
              accountingCatalog,
              item.chartOfAccountId,
            ),
        },
        {
          label: 'Centro de Custo',
          render: (item) =>
            selectCostCenterLabelById(accountingCatalog, item.costCenterId),
        },
        { label: 'Produto', render: (item) => getProductName(item.productId) },
        {
          label: 'Quantidade',
          align: 'right',
          render: (item) => item.quantity?.toLocaleString('pt-BR') ?? '-',
        },
        {
          label: 'Preco Unit.',
          align: 'right',
          render: (item) => (item.unitPrice ? fmtBRL(item.unitPrice) : '-'),
        },
        {
          label: 'Valor',
          align: 'right',
          render: (item) => (item.amount ? fmtBRL(item.amount) : '-'),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Transacao</InputLabel>
            <Select
              value={String(form.financialTransactionId ?? '')}
              label="Transacao"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  financialTransactionId: Number(event.target.value),
                }))
              }
            >
              {financialTransactions.map((financialTransaction) => (
                <MenuItem
                  key={financialTransaction.id}
                  value={String(financialTransaction.id)}
                >
                  {financialTransaction.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
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
                {postableChartOfAccounts.map((account) => (
                  <MenuItem key={account.id} value={String(account.id)}>
                    {selectChartOfAccountDisplayName(account)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Centro de Custo</InputLabel>
              <Select
                value={String(form.costCenterId ?? '')}
                label="Centro de Custo"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    costCenterId: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              >
                <MenuItem value="">- Nenhum -</MenuItem>
                {postableCostCenters.map((center) => (
                  <MenuItem key={center.id} value={String(center.id)}>
                    {selectCostCenterDisplayName(center)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Produto</InputLabel>
              <Select
                value={String(form.productId ?? '')}
                label="Produto"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    productId: event.target.value
                      ? Number(event.target.value)
                      : undefined,
                  }))
                }
              >
                <MenuItem value="">- Nenhum -</MenuItem>
                {products.map((product) => (
                  <MenuItem key={product.id} value={String(product.id)}>
                    {product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Quantidade"
              type="number"
              value={String(form.quantity ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  quantity: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Preco Unitario"
              type="number"
              value={String(form.unitPrice ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unitPrice: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              fullWidth
            />
            <TextField
              label="Valor"
              type="number"
              value={String(form.amount ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                }))
              }
              fullWidth
            />
          </Stack>
        </>
      )}
      isSaveDisabled={(form) =>
        !form.financialTransactionId || !form.chartOfAccountId || !form.amount
      }
      emptyMessage="Nenhum item financeiro cadastrado."
    />
  );
}
