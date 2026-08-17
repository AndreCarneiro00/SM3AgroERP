export interface FinancialItemAmountLike {
  quantity?: number;
  unitPrice?: number;
  amount?: number;
}

export function calculateFinancialItemAmount(
  quantity?: number,
  unitPrice?: number,
) {
  if (quantity == null || unitPrice == null) {
    return undefined;
  }

  const amount = quantity * unitPrice;

  if (!Number.isFinite(amount)) {
    return undefined;
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function resolveFinancialItemAmount(item: FinancialItemAmountLike) {
  return calculateFinancialItemAmount(item.quantity, item.unitPrice) ?? item.amount;
}
