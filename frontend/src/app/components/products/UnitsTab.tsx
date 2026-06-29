import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type {
  BaseUnit,
  BaseUnitInput,
  UnitOfMeasure,
  UnitOfMeasureInput,
} from '../../../domains/products/model/entities';
import {
  useProductsCatalogData,
  useProductsCatalogMutations,
} from '../../../domains/products/ui/hooks';
import { RowActions } from '../shared/RowActions';

interface UomDialogProps {
  open: boolean;
  onClose: () => void;
  baseUnits: BaseUnit[];
  editing?: UnitOfMeasure;
  onSave: (data: UnitOfMeasureInput) => void | Promise<void>;
  saving?: boolean;
}

function UomDialog({
  open,
  onClose,
  baseUnits,
  editing,
  onSave,
  saving = false,
}: UomDialogProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [baseUnitId, setBaseUnitId] = useState(
    String(editing?.baseUnitId ?? ''),
  );
  const [factor, setFactor] = useState(String(editing?.conversionFactor ?? '1'));

  useEffect(() => {
    setName(editing?.name ?? '');
    setBaseUnitId(String(editing?.baseUnitId ?? ''));
    setFactor(String(editing?.conversionFactor ?? '1'));
  }, [editing, open]);

  const trimmedName = name.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {editing ? 'Editar Unidade' : 'Nova Unidade de Medida'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth size="small">
            <InputLabel>Unidade Base</InputLabel>
            <Select
              value={baseUnitId}
              label="Unidade Base"
              onChange={(event) => setBaseUnitId(event.target.value)}
            >
              <MenuItem value="">- Nenhuma -</MenuItem>
              {baseUnits.map((baseUnit) => (
                <MenuItem key={baseUnit.id} value={String(baseUnit.id)}>
                  {baseUnit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Fator de Conversao"
            type="number"
            value={factor}
            onChange={(event) => setFactor(event.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!trimmedName || saving}
          onClick={() =>
            void onSave({
              name: trimmedName,
              baseUnitId: baseUnitId ? Number(baseUnitId) : undefined,
              conversionFactor: factor ? Number(factor) : undefined,
            })
          }
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UnitsTab() {
  const { unitsOfMeasure, baseUnits, isLoading } = useProductsCatalogData();
  const {
    createBaseUnit,
    createUnitOfMeasure,
    deleteBaseUnit,
    deleteUnitOfMeasure,
    updateBaseUnit,
    updateUnitOfMeasure,
  } = useProductsCatalogMutations();
  const [uomOpen, setUomOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | undefined>();
  const [baseOpen, setBaseOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<BaseUnit | undefined>();
  const [baseName, setBaseName] = useState('');

  const handleSaveUom = async (input: UnitOfMeasureInput) => {
    if (editingUom) {
      await updateUnitOfMeasure.mutateAsync({ id: editingUom.id, input });
    } else {
      await createUnitOfMeasure.mutateAsync(input);
    }

    setUomOpen(false);
    setEditingUom(undefined);
  };

  const openBase = (baseUnit?: BaseUnit) => {
    setEditingBase(baseUnit);
    setBaseName(baseUnit?.name ?? '');
    setBaseOpen(true);
  };

  const saveBase = async () => {
    const trimmedName = baseName.trim();
    if (!trimmedName) return;

    const input: BaseUnitInput = { name: trimmedName };

    if (editingBase) {
      await updateBaseUnit.mutateAsync({ id: editingBase.id, input });
    } else {
      await createBaseUnit.mutateAsync(input);
    }

    setBaseOpen(false);
    setEditingBase(undefined);
    setBaseName('');
  };

  const savingUom =
    createUnitOfMeasure.isPending || updateUnitOfMeasure.isPending;
  const savingBase = createBaseUnit.isPending || updateBaseUnit.isPending;

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box sx={{ flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Unidades de Medida
          </Typography>
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setEditingUom(undefined);
              setUomOpen(true);
            }}
          >
            + Nova
          </Button>
        </Stack>
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Unidade Base</TableCell>
                <TableCell>Fator</TableCell>
                <TableCell align="center">Acoes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">
                      Carregando unidades...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {unitsOfMeasure.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {unit.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {baseUnits.find((baseUnit) => baseUnit.id === unit.baseUnitId)
                      ?.name ?? '-'}
                  </TableCell>
                  <TableCell>{unit.conversionFactor ?? '-'}</TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => {
                        setEditingUom(unit);
                        setUomOpen(true);
                      }}
                      onDelete={() => {
                        void deleteUnitOfMeasure.mutateAsync(unit.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <UomDialog
          open={uomOpen}
          onClose={() => setUomOpen(false)}
          baseUnits={baseUnits}
          editing={editingUom}
          onSave={handleSaveUom}
          saving={savingUom}
        />
      </Box>

      <Box sx={{ width: 280 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Unidades Base
          </Typography>
          <Button size="small" variant="outlined" onClick={() => openBase()}>
            + Nova
          </Button>
        </Stack>
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Acoes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="body2" color="text.secondary">
                      Carregando unidades base...
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {baseUnits.map((baseUnit) => (
                <TableRow key={baseUnit.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {baseUnit.name}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => openBase(baseUnit)}
                      onDelete={() => {
                        void deleteBaseUnit.mutateAsync(baseUnit.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Box>

      <Dialog open={baseOpen} onClose={() => setBaseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingBase ? 'Editar Unidade Base' : 'Nova Unidade Base'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={baseName}
            onChange={(event) => setBaseName(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBaseOpen(false)} disabled={savingBase}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!baseName.trim() || savingBase}
            onClick={() => {
              void saveBase();
            }}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
