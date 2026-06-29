import type { EntityCollection } from '../../../core/collections/types';

export interface BankAccount {
  id: number;
  accountType?: string;
  accountGroup?: string;
  name: string;
  active: boolean;
  initialBalance?: number;
  initialBalanceDate?: string;
  financialInstitution?: string;
  agency?: string;
  accountNumber?: string;
}

export interface BankingCatalog {
  bankAccounts: EntityCollection<BankAccount>;
}

export interface BankAccountInput {
  accountType?: string;
  accountGroup?: string;
  name: string;
  active: boolean;
  initialBalance?: number;
  initialBalanceDate?: string;
  financialInstitution?: string;
  agency?: string;
  accountNumber?: string;
}
