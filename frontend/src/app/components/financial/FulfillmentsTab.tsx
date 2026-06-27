import { Box, Card, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useApp } from '../../context/AppContext';
import { EmptyTableRow } from '../shared/EmptyTableRow';

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s: string) => new Date(s + 'T12:00:00').toLocaleDateString('pt-BR');

export function FulfillmentsTab() {
  const { fulfillments, financialTransactions, bankAccounts } = useApp();
  const sorted = [...fulfillments].sort((a, b) => b.payment_date.localeCompare(a.payment_date));

  return (
    <Box>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Transação</TableCell>
              <TableCell>Conta Bancária</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Observação</TableCell>
              <TableCell align="right">Valor Pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(f => {
              const tx = financialTransactions.find(t => t.id === f.financial_transaction_id);
              const ba = bankAccounts.find(b => b.id === f.bank_account_id);
              return (
                <TableRow key={f.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {tx?.description ?? `#${f.financial_transaction_id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tx?.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Typography>
                  </TableCell>
                  <TableCell>{ba?.name ?? '-'}</TableCell>
                  <TableCell>{fmtDate(f.payment_date)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{f.observation ?? '-'}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {fmtBRL(f.amount_paid)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && <EmptyTableRow colSpan={5} message="Nenhum pagamento registrado." />}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
