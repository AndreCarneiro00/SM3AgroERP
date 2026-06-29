export interface BankAccountDto {
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

export type CreateBankAccountDto = Omit<BankAccountDto, 'id'>;
export type UpdateBankAccountDto = CreateBankAccountDto;
