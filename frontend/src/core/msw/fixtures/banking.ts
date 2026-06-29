import bankAccountsJson from '../../../app/data/json/bankAccounts.json';
import type { BankAccountDto } from '../../../domains/banking/api/dtos';

export function createBankingFixtures() {
  return {
    bankAccounts: structuredClone(bankAccountsJson) as BankAccountDto[],
  };
}
