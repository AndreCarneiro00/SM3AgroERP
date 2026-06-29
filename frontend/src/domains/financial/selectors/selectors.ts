import { selectAll, selectById } from '../../../core/collections/selectors';
import type {
  FinancialCatalog,
  FinancialTransaction,
  FinancialTransactionItem,
} from '../model/entities';

export function selectFinancialTransactions(catalog: FinancialCatalog) {
  return selectAll(catalog.financialTransactions);
}

export function selectFinancialTransactionAttachments(catalog: FinancialCatalog) {
  return selectAll(catalog.financialTransactionAttachments);
}

export function selectFinancialTransactionItems(catalog: FinancialCatalog) {
  return selectAll(catalog.financialTransactionItems);
}

export function selectFinancialTransactionFulfillments(catalog: FinancialCatalog) {
  return selectAll(catalog.financialTransactionFulfillments);
}

export function selectBankTransfers(catalog: FinancialCatalog) {
  return selectAll(catalog.bankTransfers);
}

export function selectFinancialTransactionDisplayName(
  financialTransaction?: Partial<FinancialTransaction>,
) {
  if (!financialTransaction) return '-';
  return financialTransaction.description?.trim() || `#${financialTransaction.id ?? '-'}`;
}

export function selectFinancialTransactionLabelById(
  catalog: FinancialCatalog,
  financialTransactionId?: number,
) {
  return selectFinancialTransactionDisplayName(
    selectById(catalog.financialTransactions, financialTransactionId),
  );
}

export function selectFinancialTransactionItemDisplayName(
  catalog: FinancialCatalog,
  financialTransactionItem?: Partial<FinancialTransactionItem>,
) {
  if (!financialTransactionItem) return '-';

  const transactionLabel = selectFinancialTransactionLabelById(
    catalog,
    financialTransactionItem.financialTransactionId,
  );

  return `#${financialTransactionItem.id ?? '-'} - ${transactionLabel}`;
}

export function selectFinancialTransactionItemLabelById(
  catalog: FinancialCatalog,
  financialTransactionItemId?: number,
) {
  return selectFinancialTransactionItemDisplayName(
    catalog,
    selectById(catalog.financialTransactionItems, financialTransactionItemId),
  );
}
