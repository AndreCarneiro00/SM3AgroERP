import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
} from '@mui/material';
import type { Product } from '../../data/types';
import { useApp } from '../../context/AppContext';

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product;
  onSave: (data: Partial<Product>) => void;
}

export function ProductDialog({ open, onClose, editing, onSave }: Props) {
  const { productFamilies, unitsOfMeasure } = useApp();
  const [name, setName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [productType, setProductType] = useState<Product['product_type']>('FINISHED_GOOD');
  const [active, setActive] = useState(true);

  useEffect(() => {
    setName(editing?.name ?? '');
    setFamilyId(String(editing?.product_family_id ?? ''));
    setUnitId(String(editing?.unit_id ?? ''));
    setProductType(editing?.product_type ?? 'FINISHED_GOOD');
    setActive(editing?.active ?? true);
  }, [editing, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nome do Produto" value={name} onChange={e => setName(e.target.value)} fullWidth />
          <FormControl fullWidth size="small">
            <InputLabel>Família</InputLabel>
            <Select value={familyId} label="Família" onChange={e => setFamilyId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {productFamilies.map(pf => (
                <MenuItem key={pf.id} value={String(pf.id)}>{pf.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Unidade de Medida</InputLabel>
            <Select value={unitId} label="Unidade de Medida" onChange={e => setUnitId(e.target.value)}>
              <MenuItem value="">— Nenhuma —</MenuItem>
              {unitsOfMeasure.map(u => (
                <MenuItem key={u.id} value={String(u.id)}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo do Produto</InputLabel>
              <Select value={productType} label="Tipo do Produto" onChange={e => setProductType(e.target.value as Product['product_type'])}>
                <MenuItem value="RAW_MATERIAL">Matéria-prima</MenuItem>
                <MenuItem value="FINISHED_GOOD">Produto acabado</MenuItem>
                <MenuItem value="CONSUMABLE">Consumível</MenuItem>
                <MenuItem value="SPARE_PART">Peça de reposição</MenuItem>
                <MenuItem value="SERVICE">Serviço</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={active ? 'active' : 'inactive'} label="Status" onChange={e => setActive(e.target.value === 'active')}>
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={!name}
          onClick={() => onSave({
            name,
            product_family_id: familyId ? Number(familyId) : undefined,
            unit_id: unitId ? Number(unitId) : undefined,
            product_type: productType,
            active,
          })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
