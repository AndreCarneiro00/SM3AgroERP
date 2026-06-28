import { TransactionsTab } from './TransactionsTab';
import { TransactionItemsTab } from './TransactionItemsTab';
import { TransactionAttachmentsTab } from './TransactionAttachmentsTab';
import { FulfillmentsTab } from './FulfillmentsTab';
import { BankTransfersTab } from './BankTransfersTab';

interface Props {
  tab: 'transactions' | 'items' | 'attachments' | 'fulfillments' | 'bank-transfers';
}

export function FinancialModule({ tab }: Props) {
  if (tab === 'items') return <TransactionItemsTab />;
  if (tab === 'attachments') return <TransactionAttachmentsTab />;
  if (tab === 'fulfillments') return <FulfillmentsTab />;
  if (tab === 'bank-transfers') return <BankTransfersTab />;
  return <TransactionsTab />;
}
