import { selectAll, selectById } from '../../../core/collections/selectors';
import type { BankingCatalog } from '../model/entities';

export function selectBankAccounts(catalog: BankingCatalog) {
  return selectAll(catalog.bankAccounts);
}

export function selectActiveBankAccounts(catalog: BankingCatalog) {
  return selectBankAccounts(catalog).filter((bankAccount) => bankAccount.active);
}

export function selectBankAccountById(
  catalog: BankingCatalog,
  bankAccountId?: number,
) {
  return selectById(catalog.bankAccounts, bankAccountId);
}

export function selectBankAccountLabelById(
  catalog: BankingCatalog,
  bankAccountId?: number,
) {
  return selectBankAccountById(catalog, bankAccountId)?.name ?? '-';
}

export function selectTotalActiveBalance(catalog: BankingCatalog) {
  return selectActiveBankAccounts(catalog).reduce(
    (sum, bankAccount) => sum + (bankAccount.initialBalance ?? 0),
    0,
  );
}
