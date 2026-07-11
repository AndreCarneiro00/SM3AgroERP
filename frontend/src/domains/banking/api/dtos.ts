export interface BankAccountDto {
  id: number;
  accountType?: string;
  accountGroup?: string;
  name: string;
  active: boolean;
  initialBalance?: number;
  currentBalance?: number;
  initialBalanceDate?: string;
  financialInstitution?: string;
  agency?: string;
  accountNumber?: string;
}

export type CreateBankAccountDto = Omit<BankAccountDto, 'id' | 'currentBalance'>;
export type UpdateBankAccountDto = CreateBankAccountDto;
