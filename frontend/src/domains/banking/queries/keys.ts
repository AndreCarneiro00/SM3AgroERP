export const bankingKeys = {
  all: ['banking'] as const,
  list: () => [...bankingKeys.all, 'bank-accounts'] as const,
};
