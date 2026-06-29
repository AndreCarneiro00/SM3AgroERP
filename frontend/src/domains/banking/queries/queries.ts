import { useQuery } from '@tanstack/react-query';
import { bankingRepository } from '../api/repository';
import { bankingKeys } from './keys';

export function useBankAccountsQuery() {
  return useQuery({
    queryKey: bankingKeys.list(),
    queryFn: bankingRepository.listBankAccounts,
  });
}
