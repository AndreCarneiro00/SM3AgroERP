import { TransactionsTab } from './TransactionsTab';
import { BankTransfersTab } from './BankTransfersTab';

interface Props {
  tab: 'transactions' | 'items' | 'attachments' | 'fulfillments' | 'bank-transfers';
}

export function FinancialModule({ tab }: Props) {
  if (tab === 'bank-transfers') return <BankTransfersTab />;
  return <TransactionsTab />;
}
