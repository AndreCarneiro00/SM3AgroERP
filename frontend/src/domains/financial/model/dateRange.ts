export interface FinancialDateRange {
  startDate?: string;
  endDate?: string;
}

export function getCurrentYearDateRange(): Required<FinancialDateRange> {
  const year = new Date().getFullYear();

  return {
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`,
  };
}

export function buildFinancialDateRange(
  startDate: string,
  endDate: string,
): FinancialDateRange | undefined {
  const range: FinancialDateRange = {};

  if (startDate) {
    range.startDate = startDate;
  }

  if (endDate) {
    range.endDate = endDate;
  }

  return Object.keys(range).length > 0 ? range : undefined;
}
