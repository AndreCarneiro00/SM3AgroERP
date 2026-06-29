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
  Product,
  ProductInput,
  ProductType,
} from '../../../domains/products/model/entities';
import {
  useProductsCatalogData,
  useProductsCatalogMutations,
} from '../../../domains/products/ui/hooks';
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

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Produto"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Familia</TableCell>
              <TableCell>Unidade de Medida</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    Carregando produtos...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {productRows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>{product.familyName}</TableCell>
                <TableCell>{product.unitName}</TableCell>
                <TableCell>{labelProductType(product.productType)}</TableCell>
                <TableCell>
                  <Chip
                    label={product.active ? 'Ativo' : 'Inativo'}
                    size="small"
                    color={product.active ? 'success' : 'default'}
                    sx={{ height: 20 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => {
                      setEditing(product);
                      setDialogOpen(true);
                    }}
                    onDelete={() => {
                      void handleDelete(product.id);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
