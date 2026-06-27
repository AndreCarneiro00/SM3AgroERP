import { TableRow, TableCell, Typography } from '@mui/material';

interface EmptyTableRowProps {
  colSpan: number;
  message?: string;
}

export function EmptyTableRow({ colSpan, message = 'Nenhum registro encontrado.' }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 4 }}>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </TableCell>
    </TableRow>
  );
}
