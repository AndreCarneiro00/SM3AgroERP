import { useEffect, useState } from 'react';
import {
  Box, Card, Typography, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { UnitOfMeasure, BaseUnit } from '../../data/types';
import { useApp } from '../../context/AppContext';
import { RowActions } from '../shared/RowActions';

function UoMDialog({ open, onClose, editing, onSave }: {
  open: boolean; onClose: () => void;
  editing?: UnitOfMeasure; onSave: (d: Partial<UnitOfMeasure>) => void;
}) {
  const { baseUnits } = useApp();
  const [name, setName] = useState(editing?.name ?? '');
  const [baseUnitId, setBaseUnitId] = useState(String(editing?.base_unit_id ?? ''));
  const [factor, setFactor] = useState(String(editing?.conversion_factor ?? '1'));

  useEffect(() => {
    setName(editing?.name ?? '');
    setBaseUnitId(String(editing?.base_unit_id ?? ''));
    setFactor(String(editing?.conversion_factor ?? '1'));
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Unidade' : 'Nova Unidade de Medida'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Unidade Base</InputLabel>
            <Select value={baseUnitId} label="Unidade Base" onChange={e => setBaseUnitId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {baseUnits.map(bu => (
                <MenuItem key={bu.id} value={String(bu.id)}>{bu.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Fator de Conversão" type="number" value={factor}
            onChange={e => setFactor(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name}
          onClick={() => onSave({
            name,
            base_unit_id: baseUnitId ? Number(baseUnitId) : undefined,
            conversion_factor: factor ? Number(factor) : undefined,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UnitsTab() {
  const { unitsOfMeasure, setUnitsOfMeasure, baseUnits, setBaseUnits, nextId } = useApp();
  const [uomOpen, setUomOpen] = useState(false);
  const [editingUom, setEditingUom] = useState<UnitOfMeasure | undefined>();
  const [baseOpen, setBaseOpen] = useState(false);
  const [editingBase, setEditingBase] = useState<BaseUnit | undefined>();
  const [baseName, setBaseName] = useState('');

  const handleSaveUom = (d: Partial<UnitOfMeasure>) => {
    setUnitsOfMeasure(us =>
      editingUom
        ? us.map(u => u.id === editingUom.id ? { ...editingUom, ...d } : u)
        : [...us, { id: nextId(us), ...d } as UnitOfMeasure]
    );
    setUomOpen(false);
  };

  const openBase = (bu?: BaseUnit) => {
    setEditingBase(bu);
    setBaseName(bu?.name ?? '');
    setBaseOpen(true);
  };

  const saveBase = () => {
    setBaseUnits(bs =>
      editingBase
        ? bs.map(b => b.id === editingBase.id ? { ...b, name: baseName } : b)
        : [...bs, { id: nextId(bs), name: baseName }]
    );
    setBaseOpen(false);
  };

  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      {/* Units of Measure */}
      <Box sx={{ flex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>Unidades de Medida</Typography>
          <Button size="small" variant="contained"
            onClick={() => { setEditingUom(undefined); setUomOpen(true); }}>
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
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unitsOfMeasure.map(u => (
                <TableRow key={u.id}>
                  <TableCell><Typography variant="body2" fontWeight={500}>{u.name}</Typography></TableCell>
                  <TableCell>{baseUnits.find(b => b.id === u.base_unit_id)?.name ?? '-'}</TableCell>
                  <TableCell>{u.conversion_factor ?? '-'}</TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => { setEditingUom(u); setUomOpen(true); }}
                      onDelete={() => setUnitsOfMeasure(us => us.filter(x => x.id !== u.id))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        <UoMDialog open={uomOpen} onClose={() => setUomOpen(false)} editing={editingUom} onSave={handleSaveUom} />
      </Box>

      {/* Base Units */}
      <Box sx={{ width: 280 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>Unidades Base</Typography>
          <Button size="small" variant="outlined" onClick={() => openBase()}>+ Nova</Button>
        </Stack>
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {baseUnits.map(bu => (
                <TableRow key={bu.id}>
                  <TableCell><Typography variant="body2" fontWeight={500}>{bu.name}</Typography></TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => openBase(bu)}
                      onDelete={() => setBaseUnits(bs => bs.filter(b => b.id !== bu.id))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Box>

      <Dialog open={baseOpen} onClose={() => setBaseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingBase ? 'Editar Unidade Base' : 'Nova Unidade Base'}</DialogTitle>
        <DialogContent>
          <TextField label="Nome" value={baseName} onChange={e => setBaseName(e.target.value)}
            fullWidth sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBaseOpen(false)}>Cancelar</Button>
          <Button variant="contained" disabled={!baseName} onClick={saveBase}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
