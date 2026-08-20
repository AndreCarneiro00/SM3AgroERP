import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { AllocationEditorRow, AllocationKey } from './fulfillmentAllocation';
import {
  ALLOCATION_TOLERANCE,
  roundCurrency,
  sumAllocationRows,
} from './fulfillmentAllocation';
import { toInputValue } from '../../forms/valueParsers';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function parseOptionalNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

interface Props {
  rows: AllocationEditorRow[];
  paymentAmount: number;
  disabled?: boolean;
  onAllocationChange: (itemKey: AllocationKey, amount?: number) => void;
  onSuggest: () => void;
}

export function FulfillmentAllocationEditor({
  rows,
  paymentAmount,
  disabled = false,
  onAllocationChange,
  onSuggest,
}: Props) {
  const allocatedAmount = sumAllocationRows(rows);
  const difference = roundCurrency(paymentAmount - allocatedAmount);
  const hasDifference = Math.abs(difference) > ALLOCATION_TOLERANCE;
  const differenceLabel = difference > 0
    ? `; falta ${fmtBRL(difference)}`
    : `; excede ${fmtBRL(Math.abs(difference))}`;

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            Alocacao por item
          </Typography>
          <Typography
            variant="caption"
            color={hasDifference ? 'error.main' : 'text.secondary'}
          >
            Alocado {fmtBRL(allocatedAmount)} de {fmtBRL(paymentAmount)}
            {hasDifference ? differenceLabel : ''}
          </Typography>
        </Box>
        <Button size="small" onClick={onSuggest} disabled={disabled}>
          Sugerir
        </Button>
      </Stack>

      <Stack spacing={0.75}>
        {rows.map((row) => (
          <Box
            key={String(row.itemKey)}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'minmax(160px, 1.4fr) repeat(3, minmax(82px, 0.75fr)) minmax(110px, 0.9fr)',
              },
              gap: 1,
              alignItems: 'center',
              p: 1,
              bgcolor: '#F7F8FA',
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              {row.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Item {fmtBRL(row.itemAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ja alocado {fmtBRL(row.alreadyAllocatedAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Disponivel {fmtBRL(row.availableAmount)}
            </Typography>
            <TextField
              label="Alocar"
              type="number"
              size="small"
              value={toInputValue(row.allocatedAmount)}
              disabled={disabled}
              onChange={(event) =>
                onAllocationChange(
                  row.itemKey,
                  parseOptionalNumber(event.target.value),
                )
              }
              inputProps={{
                min: 0,
                max: row.availableAmount,
                step: '0.01',
              }}
            />
          </Box>
        ))}
        {rows.length === 0 && (
          <Typography variant="caption" color="error.main">
            Informe ao menos um item valido antes de alocar o pagamento.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
