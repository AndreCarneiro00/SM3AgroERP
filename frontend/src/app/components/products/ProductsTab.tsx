import { useState } from 'react';
import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import type { Product } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { ProductDialog } from './ProductDialog';

export function ProductsTab() {
  const { products, setProducts, productFamilies, unitsOfMeasure, nextId } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();

  const handleSave = (d: Partial<Product>) => {
    setProducts(ps =>
      editing
        ? ps.map(p => p.id === editing.id ? { ...editing, ...d } : p)
        : [...ps, { id: nextId(ps), ...d } as Product]
    );
    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader actionLabel="Novo Produto" onAction={() => { setEditing(undefined); setDialogOpen(true); }} />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Família</TableCell>
              <TableCell>Unidade de Medida</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.id}>
                <TableCell><Typography variant="body2" fontWeight={500}>{p.name}</Typography></TableCell>
                <TableCell>{productFamilies.find(pf => pf.id === p.product_family_id)?.name ?? '-'}</TableCell>
                <TableCell>{unitsOfMeasure.find(u => u.id === p.unit_id)?.name ?? '-'}</TableCell>
                <TableCell>{labelProductType(p.product_type)}</TableCell>
                <TableCell>
                  <Chip label={p.active ? 'Ativo' : 'Inativo'} size="small" color={p.active ? 'success' : 'default'} sx={{ height: 20 }} />
                </TableCell>
                <TableCell align="center">
                  <RowActions
                    onEdit={() => { setEditing(p); setDialogOpen(true); }}
                    onDelete={() => setProducts(ps => ps.filter(x => x.id !== p.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} editing={editing} onSave={handleSave} />
    </Box>
  );
}

function labelProductType(type: Product['product_type']) {
  const labels: Record<Product['product_type'], string> = {
    RAW_MATERIAL: 'Matéria-prima',
    FINISHED_GOOD: 'Produto acabado',
    CONSUMABLE: 'Consumível',
    SPARE_PART: 'Reposição',
    SERVICE: 'Serviço',
  };
  return labels[type];
}
