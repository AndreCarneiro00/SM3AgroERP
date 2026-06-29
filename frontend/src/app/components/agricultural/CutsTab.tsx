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
import {
  useAgriculturalCatalogData,
  useAgriculturalMutations,
} from '../../../domains/agricultural/ui/hooks';
import type {
  Cut,
  CutInput,
} from '../../../domains/agricultural/model/entities';
import { useProductsCatalogData } from '../../../domains/products/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { CutDialog } from './CutDialog';

const fmtDate = (value?: string) =>
  value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '-';

export function CutsTab() {
  const { cuts, fields } = useAgriculturalCatalogData();
  const { createCut, updateCut, deleteCut } = useAgriculturalMutations();
  const { catalog, productFamilies } = useProductsCatalogData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Cut | undefined>();

  const sorted = [...cuts].sort((left, right) =>
    (right.cutDate ?? '').localeCompare(left.cutDate ?? ''),
  );

  const getProductFamilyName = (productFamilyId?: number) =>
    catalog.productFamilies.byId[productFamilyId ?? -1]?.name ?? '-';

  const handleSave = async (input: CutInput) => {
    if (editing) {
      await updateCut.mutateAsync({ id: editing.id, input });
    } else {
      await createCut.mutateAsync(input);
    }

    setDialogOpen(false);
  };

  return (
    <Box>
      <PageHeader
        actionLabel="Novo Corte"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      />

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Campo</TableCell>
              <TableCell>Familia</TableCell>
              <TableCell>Numero do Corte</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Dias desde ultimo</TableCell>
              <TableCell>Observacao</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((cut) => {
              const field = fields.find((item) => item.id === cut.fieldId);

              return (
                <TableRow key={cut.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {field?.name ?? '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getProductFamilyName(cut.productFamilyId)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`#${cut.cutNumber ?? '-'}`}
                      size="small"
                      color="primary"
                      sx={{ height: 20 }}
                    />
                  </TableCell>
                  <TableCell>{fmtDate(cut.cutDate)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {cut.daysSinceLastCut
                      ? `${cut.daysSinceLastCut} dias`
                      : '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'text.secondary',
                    }}
                  >
                    {cut.observation ?? '-'}
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => {
                        setEditing(cut);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        void deleteCut.mutateAsync(cut.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={7} />}
          </TableBody>
        </Table>
      </Card>

      <CutDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        fields={fields}
        productFamilies={productFamilies}
        saving={createCut.isPending || updateCut.isPending}
        onSave={(input) => {
          void handleSave(input);
        }}
      />
    </Box>
  );
}
