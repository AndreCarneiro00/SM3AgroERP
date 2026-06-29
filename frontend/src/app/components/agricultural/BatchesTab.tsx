import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import type {
  ProductionBatch,
  ProductionBatchInput,
} from '../../../domains/agricultural/model/entities';
import { selectCutLabelById } from '../../../domains/agricultural/selectors/selectors';
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import { useInventoryCatalogData } from '../../../domains/inventory/ui/hooks';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { CrudTable } from '../shared/CrudTable';

function toProductionBatchInput(
  form: Partial<ProductionBatch>,
): ProductionBatchInput {
  return {
    inventoryBatchId: form.inventoryBatchId,
    qualityGrade: form.qualityGrade,
    cutId: form.cutId,
    observation: form.observation,
  };
}

export function BatchesTab() {
  const { catalog: agriculturalCatalog, productionBatches, cuts } =
    useAgriculturalCatalogData();
  const {
    createProductionBatch,
    updateProductionBatch,
    deleteProductionBatch,
  } = useAgriculturalMutations();
  const { inventoryBatches } = useInventoryCatalogData();
  const { catalog: productsCatalog } = useProductsCatalogData();

  const getProductName = (productId?: number) =>
    productsCatalog.products.byId[productId ?? -1]?.name;

  return (
    <CrudTable<ProductionBatch>
      items={productionBatches}
      onCreate={(input) =>
        createProductionBatch.mutateAsync(toProductionBatchInput(input))
      }
      onUpdate={({ id, input }) =>
        updateProductionBatch.mutateAsync({
          id,
          input: toProductionBatchInput(input),
        })
      }
      onDelete={(id) => deleteProductionBatch.mutateAsync(id)}
      actionLabel="Novo Lote de Producao"
      dialogTitle={(editing) =>
        editing ? 'Editar Lote de Producao' : 'Novo Lote de Producao'
      }
      createInitial={() => ({})}
      columns={[
        {
          label: 'Lote de Estoque',
          render: (item) => {
            const inventoryBatch = inventoryBatches.find(
              (batch) => batch.id === item.inventoryBatchId,
            );
            const productName = getProductName(inventoryBatch?.productId);

            return (
              <Typography variant="body2" fontWeight={500}>
                {inventoryBatch?.code ?? '-'}
                {productName ? ` - ${productName}` : ''}
              </Typography>
            );
          },
        },
        {
          label: 'Corte',
          render: (item) =>
            item.cutId ? selectCutLabelById(agriculturalCatalog, item.cutId) : '-',
        },
        { label: 'Qualidade', render: (item) => item.qualityGrade ?? '-' },
        { label: 'Observacao', render: (item) => item.observation ?? '-' },
      ]}
      renderForm={({ form, setForm }) => (
        <>
          <FormControl fullWidth size="small">
            <InputLabel>Lote de Estoque</InputLabel>
            <Select
              value={String(form.inventoryBatchId ?? '')}
              label="Lote de Estoque"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  inventoryBatchId: Number(event.target.value),
                }))
              }
            >
              {inventoryBatches.map((batch) => (
                <MenuItem key={batch.id} value={String(batch.id)}>
                  {batch.code} - {getProductName(batch.productId) ?? 'Produto'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Corte</InputLabel>
            <Select
              value={String(form.cutId ?? '')}
              label="Corte"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cutId: Number(event.target.value),
                }))
              }
            >
              {cuts.map((cut) => (
                <MenuItem key={cut.id} value={String(cut.id)}>
                  {selectCutLabelById(agriculturalCatalog, cut.id)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Qualidade"
            value={form.qualityGrade ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                qualityGrade: event.target.value || undefined,
              }))
            }
            fullWidth
          />
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
      isSaveDisabled={(form) => !form.inventoryBatchId || !form.cutId}
      emptyMessage="Nenhum lote de producao cadastrado."
    />
  );
}
