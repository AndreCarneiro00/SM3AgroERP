import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type {
  FieldOperationItem,
  FieldOperationItemInput,
} from '../../../domains/agricultural/model/entities';
import { selectFieldOperationLabelById } from '../../../domains/agricultural/selectors/selectors';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import {
  selectInventoryMovementLabelById,
} from '../../../domains/inventory/selectors/selectors';
import { useInventoryCatalogData } from '../../../domains/inventory/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function toFieldOperationItemInput(
  form: Partial<FieldOperationItem>,
): FieldOperationItemInput {
  return {
    fieldOperationId: form.fieldOperationId,
    productId: form.productId,
    quantity: form.quantity,
    unitCost: form.unitCost,
    amount: form.amount,
    inventoryMovementId: form.inventoryMovementId,
    observation: form.observation,
  };
}

export function FieldOperationItemsTab() {
  const { catalog: agriculturalCatalog, fieldOperationItems, fieldOperations } =
    useAgriculturalCatalogData();
  const {
    createFieldOperationItem,
    updateFieldOperationItem,
    deleteFieldOperationItem,
  } = useAgriculturalMutations();
  const { catalog: inventoryCatalog, inventoryMovements } =
    useInventoryCatalogData();
  const { catalog: productsCatalog, products } = useProductsCatalogData();

  const getProductName = (productId?: number) =>
    productsCatalog.products.byId[productId ?? -1]?.name ?? '-';

  return (
    <CrudTable<FieldOperationItem>
      items={fieldOperationItems}
      onCreate={(input) =>
        createFieldOperationItem.mutateAsync(toFieldOperationItemInput(input))
      }
      onUpdate={({ id, input }) =>
        updateFieldOperationItem.mutateAsync({
          id,
          input: toFieldOperationItemInput(input),
        })
      }
      onDelete={(id) => deleteFieldOperationItem.mutateAsync(id)}
      actionLabel="Novo Item de Operacao"
      dialogTitle={(editing) =>
        editing ? 'Editar Item de Operacao' : 'Novo Item de Operacao'
      }
      createInitial={() => ({})}
      columns={[
        {
          label: 'Operacao',
          render: (item) => (
            <Typography variant="body2" fontWeight={500}>
              {selectFieldOperationLabelById(
                agriculturalCatalog,
                item.fieldOperationId,
              )}
            </Typography>
          ),
        },
        { label: 'Produto', render: (item) => getProductName(item.productId) },
        {
          label: 'Quantidade',
          align: 'right',
          render: (item) => item.quantity?.toLocaleString('pt-BR') ?? '-',
        },
        {
          label: 'Custo Unit.',
          align: 'right',
          render: (item) => (item.unitCost ? fmtBRL(item.unitCost) : '-'),
        },
        {
          label: 'Valor',
          align: 'right',
          render: (item) => (item.amount ? fmtBRL(item.amount) : '-'),
        },
        {
          label: 'Movimento',
          render: (item) =>
            selectInventoryMovementLabelById(
              inventoryCatalog,
              item.inventoryMovementId,
            ),
        },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Operacao</InputLabel>
            <Select
              value={String(form.fieldOperationId ?? '')}
              label="Operacao"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fieldOperationId: Number(event.target.value),
                }))
              }
            >
              {fieldOperations.map((operation) => (
                <MenuItem key={operation.id} value={String(operation.id)}>
                  {selectFieldOperationLabelById(
                    agriculturalCatalog,
                    operation.id,
                  )}
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
                  productId: Number(event.target.value),
                }))
              }
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={String(product.id)}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
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
            <TextField
              label="Custo Unitario"
              type="number"
              value={String(form.unitCost ?? '')}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  unitCost: event.target.value
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
          <FormControl fullWidth size="small">
            <InputLabel>Movimento de Estoque</InputLabel>
            <Select
              value={String(form.inventoryMovementId ?? '')}
              label="Movimento de Estoque"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  inventoryMovementId: Number(event.target.value),
                }))
              }
            >
              {inventoryMovements.map((movement) => (
                <MenuItem key={movement.id} value={String(movement.id)}>
                  {selectInventoryMovementLabelById(inventoryCatalog, movement.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Observacao"
            value={form.observation ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                observation: event.target.value || undefined,
              }))
            }
            fullWidth
            multiline
            rows={2}
          />
        </>
      )}
      isSaveDisabled={(form) =>
        !form.fieldOperationId ||
        !form.productId ||
        !form.quantity ||
        !form.inventoryMovementId
      }
      emptyMessage="Nenhum item de operacao cadastrado."
    />
  );
}
