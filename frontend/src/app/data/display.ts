import type { Counterparty } from './types';

export function getCounterpartyName(counterparty?: Partial<Counterparty>) {
  if (!counterparty) return '-';
  return counterparty.trade_name?.trim() || counterparty.legal_name?.trim() || '-';
}
