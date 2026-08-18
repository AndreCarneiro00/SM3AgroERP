import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import type {
  Product,
  ProductInput,
  ProductRow,
  ProductType,
} from '../../../domains/products/model/entities';
import {
  useProductsCatalogData,
  useProductsCatalogMutations,
} from '../../../domains/products/ui/hooks';
import { AppDataGrid } from '../shared/AppDataGrid';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { ProductDialog } from './ProductDialog';

export function ProductsTab() {
  const { productFamilies, productRows, unitsOfMeasure, isLoading } =
    useProductsCatalogData();
  const { createProduct, deleteProduct, updateProduct } =
    useProductsCatalogMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  const handleSave = async (input: ProductInput) => {
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, input });
    } else {
      await createProduct.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async (productId: number) => {
    await deleteProduct.mutateAsync(productId);
  };

  const saving = createProduct.isPending || updateProduct.isPending;

  const columns = useMemo<GridColDef<ProductRow>[]>(
    () => [
      {
        field: 'name',
        headerName: 'Nome',
        flex: 1.2,
        minWidth: 180,
        renderCell: ({ row }) => (
          <Typography variant="body2" fontWeight={500}>
            {row.name}
          </Typography>
        ),
      },
      {
        field: 'familyName',
        headerName: 'Familia',
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'unitName',
        headerName: 'Unidade de Medida',
        flex: 1,
        minWidth: 150,
      },
      {
        field: 'productType',
        headerName: 'Tipo',
        flex: 1,
        minWidth: 150,
        valueFormatter: (value) => labelProductType(value as ProductType),
      },
      {
        field: 'hasStock',
        headerName: 'Estoque',
        flex: 0.9,
        minWidth: 150,
        valueFormatter: (value) => labelStockControl(value as boolean | null),
        renderCell: ({ row }) => (
          <Stack spacing={0.25}>
            <Chip
              label={labelStockControl(row.hasStock)}
              size="small"
              color={
                row.hasStock === true
                  ? 'info'
                  : row.hasStock === false
                    ? 'default'
                    : 'warning'
              }
              sx={{ height: 20, width: 'fit-content' }}
            />
            {row.hasStock && row.stockControlStartDate && (
              <Typography variant="caption" color="text.secondary">
                {formatDate(row.stockControlStartDate)}
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        field: 'active',
        headerName: 'Status',
        flex: 0.7,
        minWidth: 110,
        valueFormatter: (value) => (value ? 'Ativo' : 'Inativo'),
        renderCell: ({ row }) => (
          <Chip
            label={row.active ? 'Ativo' : 'Inativo'}
            size="small"
            color={row.active ? 'success' : 'default'}
            sx={{ height: 20 }}
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Acoes',
        width: 110,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
        filterable: false,
        disableExport: true,
        renderCell: ({ row }) => (
          <RowActions
            onEdit={() => {
              setEditing(row);
              setDialogOpen(true);
            }}
            onDelete={() => {
              void handleDelete(row.id);
            }}
          />
        ),
      },
    ],
    [deleteProduct],
  );

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Produto"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <AppDataGrid
        rows={productRows}
        columns={columns}
        loading={isLoading}
        emptyMessage="Nenhum produto cadastrado."
        exportFileName="produtos"
      />

      <ProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        productFamilies={productFamilies}
        unitsOfMeasure={unitsOfMeasure}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}

function labelStockControl(hasStock?: boolean | null) {
  if (hasStock === true) return 'Controla';
  if (hasStock === false) return 'Nao controla';
  return 'Nao definido';
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
}

function labelProductType(type: ProductType) {
  const labels: Record<ProductType, string> = {
    RAW_MATERIAL: 'Materia-prima',
    FINISHED_GOOD: 'Produto acabado',
    CONSUMABLE: 'Consumivel',
    SPARE_PART: 'Reposicao',
    SERVICE: 'Servico',
  };

  return labels[type];
}
