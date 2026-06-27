import { TransactionsTab } from './TransactionsTab';
import { FulfillmentsTab } from './FulfillmentsTab';
import { BankTransfersTab } from './BankTransfersTab';

interface Props {
  tab: 'transactions' | 'fulfillments' | 'bank-transfers';
}

export function FinancialModule({ tab }: Props) {
  if (tab === 'fulfillments') return <FulfillmentsTab />;
  if (tab === 'bank-transfers') return <BankTransfersTab />;
  return <TransactionsTab />;
}
