import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  selectBankAccountLabelById,
} from '../../../domains/banking/selectors/selectors';
import { useBankAccountsData } from '../../../domains/banking/ui/hooks';
import {
  selectFinancialTransactionLabelById,
} from '../../../domains/financial/selectors/selectors';
import { useFinancialCatalogData } from '../../../domains/financial/ui/hooks';
import { EmptyTableRow } from '../shared/EmptyTableRow';

const fmtBRL = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');

export function FulfillmentsTab() {
  const {
    catalog: financialCatalog,
    financialTransactions,
    financialTransactionFulfillments,
  } = useFinancialCatalogData();
  const { catalog } = useBankAccountsData();
  const sorted = [...financialTransactionFulfillments].sort((left, right) =>
    right.paymentDate.localeCompare(left.paymentDate),
  );

  return (
    <Box>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Transacao</TableCell>
              <TableCell>Conta Bancaria</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Observacao</TableCell>
              <TableCell align="right">Valor Pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((fulfillment) => {
              const transaction = financialTransactions.find(
                (item) => item.id === fulfillment.financialTransactionId,
              );

              return (
                <TableRow key={fulfillment.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {selectFinancialTransactionLabelById(
                        financialCatalog,
                        fulfillment.financialTransactionId,
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction
                        ? transaction.type === 'INCOME'
                          ? 'Receita'
                          : 'Despesa'
                        : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {selectBankAccountLabelById(catalog, fulfillment.bankAccountId)}
                  </TableCell>
                  <TableCell>{fmtDate(fulfillment.paymentDate)}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {fulfillment.observation ?? '-'}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {fmtBRL(fulfillment.amountPaid)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
            {sorted.length === 0 && (
              <EmptyTableRow colSpan={5} message="Nenhum pagamento registrado." />
            )}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
