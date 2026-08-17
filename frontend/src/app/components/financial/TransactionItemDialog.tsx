import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  ChartOfAccount,
  CostCenter,
} from '../../../domains/accounting/model/entities';
import type {
  FinancialTransactionItem,
  FinancialTransactionItemInput,
} from '../../../domains/financial/model/entities';
import type { Product } from '../../../domains/products/model/entities';
import { toInputValue } from '../../forms/valueParsers';
import {
  calculateFinancialItemAmount,
  resolveFinancialItemAmount,
} from './itemAmount';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: FinancialTransactionItem;
  financialTransactionId?: number;
  chartOfAccounts: ChartOfAccount[];
  costCenters: CostCenter[];
  products: Product[];
  onSave: (input: FinancialTransactionItemInput) => void | Promise<void>;
  saving?: boolean;
}

function getEntityLabel(entity: { code?: string; name: string }) {
  return entity.code ? `${entity.code} - ${entity.name}` : entity.name;
}

function parseOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function mergeItemWithResolvedAmount(
  item: FinancialTransactionItemInput,
  patch: Partial<FinancialTransactionItemInput>,
): FinancialTransactionItemInput {
  const nextItem = { ...item, ...patch };
  const shouldRecalculate =
    Object.prototype.hasOwnProperty.call(patch, 'quantity') ||
    Object.prototype.hasOwnProperty.call(patch, 'unitPrice');

  if (!shouldRecalculate) {
    return nextItem;
  }

  return {
    ...nextItem,
    amount: calculateFinancialItemAmount(nextItem.quantity, nextItem.unitPrice),
  };
}

function getInitialForm(
  financialTransactionId?: number,
  editing?: FinancialTransactionItem,
): FinancialTransactionItemInput {
  return {
    financialTransactionId: editing?.financialTransactionId ?? financialTransactionId,
    chartOfAccountId: editing?.chartOfAccountId,
    costCenterId: editing?.costCenterId,
    quantity: editing?.quantity,
    unitPrice: editing?.unitPrice,
    amount: resolveFinancialItemAmount({
      quantity: editing?.quantity,
      unitPrice: editing?.unitPrice,
      amount: editing?.amount,
    }),
    productId: editing?.productId,
    inventoryBatchId: editing?.inventoryBatchId,
  };
}

export function TransactionItemDialog({
  open,
  onClose,
  editing,
  financialTransactionId,
  chartOfAccounts,
  costCenters,
  products,
  onSave,
  saving = false,
}: Props) {
  const [form, setForm] = useState<FinancialTransactionItemInput>(
    getInitialForm(financialTransactionId, editing),
  );

  useEffect(() => {
    if (!open) return;
    setForm(getInitialForm(financialTransactionId, editing));
  }, [editing, financialTransactionId, open]);

  const resolvedAmount = resolveFinancialItemAmount(form);
  const selectedProduct = products.find((product) => product.id === form.productId);
  const stockBlocked =
    !!editing?.inventoryMovementId ||
    (selectedProduct
      ? selectedProduct.hasStock === true ||
        selectedProduct.hasStock === null ||
        selectedProduct.hasStock === undefined
      : false);
  const saveDisabled =
    saving ||
    stockBlocked ||
    !form.financialTransactionId ||
    !form.chartOfAccountId ||
    !resolvedAmount ||
    resolvedAmount <= 0;

  const handleSave = async () => {
    await onSave({
      ...form,
      amount: resolvedAmount,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editing ? 'Editar Item' : 'Novo Item'}</DialogTitle>
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
              {chartOfAccounts.map((account) => (
                <MenuItem key={account.id} value={String(account.id)}>
                  {getEntityLabel(account)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.5}>
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
                {costCenters.map((center) => (
                  <MenuItem key={center.id} value={String(center.id)}>
                    {getEntityLabel(center)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Quantidade"
              type="number"
              value={toInputValue(form.quantity)}
              onChange={(event) =>
                setForm((current) =>
                  mergeItemWithResolvedAmount(current, {
                    quantity: parseOptionalNumber(event.target.value),
                  }),
                )
              }
              fullWidth
            />
            <TextField
              label="Preco Unitario"
              type="number"
              value={toInputValue(form.unitPrice)}
              onChange={(event) =>
                setForm((current) =>
                  mergeItemWithResolvedAmount(current, {
                    unitPrice: parseOptionalNumber(event.target.value),
                  }),
                )
              }
              fullWidth
            />
            <TextField
              label="Valor"
              type="number"
              value={toInputValue(resolvedAmount)}
              InputProps={{ readOnly: true }}
              fullWidth
              required
            />
          </Stack>

          {editing?.inventoryMovementId && (
            <Typography variant="caption" color="text.secondary">
              Movimento de estoque #{editing.inventoryMovementId}
              {editing.inventoryBatchId ? ` - lote #${editing.inventoryBatchId}` : ''}
            </Typography>
          )}

          {stockBlocked && !editing?.inventoryMovementId && (
            <Typography variant="caption" color="error.main">
              Produtos com estoque devem ser lancados na criacao completa da
              transacao.
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={saveDisabled}
          onClick={() => {
            void handleSave();
          }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
