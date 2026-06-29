import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
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
import SearchIcon from '@mui/icons-material/Search';
import type {
  Counterparty,
  CounterpartyInput,
} from '../../../domains/master-data/model/entities';
import {
  useMasterDataCatalogData,
  useMasterDataMutations,
} from '../../../domains/master-data/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';
import { PageHeader } from '../shared/PageHeader';
import { RowActions } from '../shared/RowActions';
import { CounterpartyDialog } from './CounterpartyDialog';

export function CounterpartiesTab() {
  const {
    counterparties,
    counterpartyRows,
    counterpartyTypes,
    segments,
  } = useMasterDataCatalogData();
  const {
    createCounterparty,
    deleteCounterparty,
    updateCounterparty,
  } = useMasterDataMutations();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Counterparty | undefined>();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filtered = useMemo(() => {
    let list = counterpartyRows;

    if (search) {
      const query = search.toLowerCase();
      list = list.filter(
        (counterparty) =>
          counterparty.displayName.toLowerCase().includes(query) ||
          counterparty.legalName.toLowerCase().includes(query) ||
          counterparty.document?.includes(search) ||
          counterparty.email?.toLowerCase().includes(query),
      );
    }

    if (typeFilter) {
      list = list.filter(
        (counterparty) => String(counterparty.counterpartyTypeId) === typeFilter,
      );
    }

    return list;
  }, [counterpartyRows, search, typeFilter]);

  const handleSave = async (input: CounterpartyInput) => {
    if (editing) {
      await updateCounterparty.mutateAsync({ id: editing.id, input });
    } else {
      await createCounterparty.mutateAsync(input);
    }

    setDialogOpen(false);
    setEditing(undefined);
  };

  const saving = createCounterparty.isPending || updateCounterparty.isPending;

  return (
    <Box>
      <PageHeader
        actionLabel="Nova Contraparte"
        onAction={() => {
          setEditing(undefined);
          setDialogOpen(true);
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar por nome, CNPJ ou e-mail..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={typeFilter}
            label="Tipo"
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {counterpartyTypes.map((counterpartyType) => (
              <MenuItem
                key={counterpartyType.id}
                value={String(counterpartyType.id)}
              >
                {counterpartyType.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </PageHeader>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nome / Razao Social</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Cidade/UF</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Segmento</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((counterparty) => {
              const typeColor: 'success' | 'warning' | 'default' =
                counterparty.counterpartyTypeName === 'Cliente'
                  ? 'success'
                  : counterparty.counterpartyTypeName === 'Fornecedor'
                    ? 'warning'
                    : 'default';

              return (
                <TableRow key={counterparty.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {counterparty.displayName}
                    </Typography>
                    {counterparty.tradeName && (
                      <Typography variant="caption" color="text.secondary">
                        {counterparty.legalName}
                      </Typography>
                    )}
                    {counterparty.email && (
                      <Typography variant="caption" color="text.secondary">
                        {counterparty.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {counterparty.counterpartyTypeId && (
                      <Chip
                        label={counterparty.counterpartyTypeName}
                        size="small"
                        color={typeColor}
                        sx={{ height: 20 }}
                      />
                    )}
                  </TableCell>
                  <TableCell
                    sx={{ fontFamily: 'monospace', fontSize: '0.76rem' }}
                  >
                    {counterparty.documentType && (
                      <Box
                        component="span"
                        sx={{ mr: 0.5, fontSize: '0.68rem', color: '#888' }}
                      >
                        {counterparty.documentType}
                      </Box>
                    )}
                    {counterparty.document ?? '-'}
                  </TableCell>
                  <TableCell>
                    {counterparty.city && counterparty.state
                      ? `${counterparty.city}/${counterparty.state}`
                      : counterparty.city ?? counterparty.state ?? '-'}
                  </TableCell>
                  <TableCell>{counterparty.phoneNumber ?? '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {counterparty.segmentName}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={counterparty.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={counterparty.active ? 'success' : 'default'}
                      sx={{ height: 20 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <RowActions
                      onEdit={() => {
                        const original = counterparties.find(
                          (item) => item.id === counterparty.id,
                        );
                        setEditing(original);
                        setDialogOpen(true);
                      }}
                      onDelete={() => {
                        void deleteCounterparty.mutateAsync(counterparty.id);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <EmptyTableRow
                colSpan={8}
                message="Nenhuma contraparte encontrada."
              />
            )}
          </TableBody>
        </Table>
      </Card>

      <CounterpartyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        counterpartyTypes={counterpartyTypes}
        segments={segments}
        onSave={handleSave}
        saving={saving}
      />
    </Box>
  );
}
