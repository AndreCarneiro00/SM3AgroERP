import { normalizeById } from '../../../core/collections/normalize';
import type {
  BankAccountDto,
  CreateBankAccountDto,
} from '../api/dtos';
import type {
  BankAccount,
  BankAccountInput,
  BankingCatalog,
} from './entities';

export function mapBankAccountDto(dto: BankAccountDto): BankAccount {
  return {
    id: dto.id,
    accountType: dto.accountType,
    accountGroup: dto.accountGroup,
    name: dto.name,
    active: dto.active,
    initialBalance: dto.initialBalance,
    initialBalanceDate: dto.initialBalanceDate,
    financialInstitution: dto.financialInstitution,
    agency: dto.agency,
    accountNumber: dto.accountNumber,
  };
}

export function mapBankAccountInputToDto(
  input: BankAccountInput,
): CreateBankAccountDto {
  return {
    accountType: input.accountType,
    accountGroup: input.accountGroup,
    name: input.name,
    active: input.active,
    initialBalance: input.initialBalance,
    initialBalanceDate: input.initialBalanceDate,
    financialInstitution: input.financialInstitution,
    agency: input.agency,
    accountNumber: input.accountNumber,
  };
}

export function createBankingCatalog(params: {
  bankAccounts: BankAccountDto[];
}): BankingCatalog {
  const bankAccounts = params.bankAccounts.map(mapBankAccountDto);

  return {
    bankAccounts: normalizeById(bankAccounts),
  };
}
