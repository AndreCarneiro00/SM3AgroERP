import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type {
  BankAccountDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
} from './dtos';

const BANK_ACCOUNTS_API_BASE = {
  mock: '/api/bank-accounts',
  api: '/bank-account',
} as const;

export const bankingRepository = {
  listBankAccounts: () =>
    httpListRequest<BankAccountDto>(resolveResourcePath(BANK_ACCOUNTS_API_BASE)),
  createBankAccount: (payload: CreateBankAccountDto) =>
    httpRequest<BankAccountDto>(resolveResourcePath(BANK_ACCOUNTS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBankAccount: (id: number, payload: UpdateBankAccountDto) =>
    httpRequest<BankAccountDto>(resolveResourceItemPath(BANK_ACCOUNTS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteBankAccount: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(BANK_ACCOUNTS_API_BASE, id), {
      method: 'DELETE',
    }),
};
