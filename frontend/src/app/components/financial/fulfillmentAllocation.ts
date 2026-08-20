export type AllocationKey = string | number;

export interface AllocationEditorRow {
  itemKey: AllocationKey;
  label: string;
  itemAmount: number;
  alreadyAllocatedAmount: number;
  availableAmount: number;
  allocatedAmount?: number;
}

export interface SuggestedAllocation {
  itemKey: AllocationKey;
  amount: number;
}

export const ALLOCATION_TOLERANCE = 0.009;

export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function sumAllocationRows(rows: AllocationEditorRow[]) {
  return roundCurrency(
    rows.reduce((sum, row) => sum + (row.allocatedAmount ?? 0), 0),
  );
}

export function currencyMatches(left: number, right: number) {
  return Math.abs(roundCurrency(left - right)) <= ALLOCATION_TOLERANCE;
}

export function buildSuggestedAllocations(
  rows: AllocationEditorRow[],
  paymentAmount: number,
): SuggestedAllocation[] {
  let remainingAmount = roundCurrency(paymentAmount);
  const suggestions: SuggestedAllocation[] = [];

  rows.forEach((row) => {
    if (remainingAmount <= 0 || row.availableAmount <= 0) {
      return;
    }

    const allocatedAmount = roundCurrency(
      Math.min(row.availableAmount, remainingAmount),
    );

    if (allocatedAmount <= 0) {
      return;
    }

    suggestions.push({
      itemKey: row.itemKey,
      amount: allocatedAmount,
    });
    remainingAmount = roundCurrency(remainingAmount - allocatedAmount);
  });

  return suggestions;
}

export function validateAllocationRows(
  rows: AllocationEditorRow[],
  paymentAmount: number,
) {
  const positiveRows = rows.filter((row) => (row.allocatedAmount ?? 0) > 0);

  if (positiveRows.length === 0) {
    return 'Informe a alocacao do pagamento por item.';
  }

  const allocatedAmount = sumAllocationRows(rows);

  if (!currencyMatches(allocatedAmount, paymentAmount)) {
    return 'A soma das alocacoes deve ser igual ao valor pago.';
  }

  const exceededRow = rows.find(
    (row) =>
      roundCurrency(row.allocatedAmount ?? 0) -
        roundCurrency(row.availableAmount) >
      ALLOCATION_TOLERANCE,
  );

  if (exceededRow) {
    return `A alocacao excede o valor disponivel do item ${exceededRow.label}.`;
  }

  return undefined;
}
