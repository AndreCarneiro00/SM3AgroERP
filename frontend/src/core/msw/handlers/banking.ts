import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  BankAccountDto,
  CreateBankAccountDto,
} from '../../../domains/banking/api/dtos';
import { cashManagementState } from '../state/cashManagement';
import {
  listBankAccountsWithCurrentBalance,
  withCurrentBalance,
} from '../utils/bankBalances';

const fixtures = cashManagementState;

function nextId(items: Array<{ id: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

function parseId(rawId?: string) {
  if (!rawId) return undefined;
  const parsed = Number(rawId);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function notFound() {
  return HttpResponse.json({ message: 'Not found' }, { status: 404 });
}

function badRequest(message: string) {
  return HttpResponse.json({ message }, { status: 400 });
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeBalance(value?: number) {
  return roundCurrency(value ?? 0);
}

function hasFinancialMovements(bankAccountId: number) {
  return (
    fixtures.financialTransactionFulfillments.some(
      (fulfillment) => fulfillment.bankAccountId === bankAccountId,
    ) ||
    fixtures.bankTransfers.some(
      (bankTransfer) =>
        bankTransfer.sourceBankAccountId === bankAccountId ||
        bankTransfer.destinationBankAccountId === bankAccountId,
    )
  );
}

export const bankingHandlers: RequestHandler[] = [
  http.get(`/api/bank-accounts`, () => {
    return HttpResponse.json(listBankAccountsWithCurrentBalance(fixtures));
  }),
  http.post(`/api/bank-accounts`, async ({ request }) => {
    const payload = (await request.json()) as CreateBankAccountDto;
    const created: BankAccountDto = {
      id: nextId(fixtures.bankAccounts),
      accountType: payload.accountType,
      accountGroup: payload.accountGroup,
      name: payload.name,
      active: payload.active,
      initialBalance: payload.initialBalance ?? 0,
      initialBalanceDate: payload.initialBalanceDate,
      financialInstitution: payload.financialInstitution,
      agency: payload.agency,
      accountNumber: payload.accountNumber,
    };
    fixtures.bankAccounts.push(created);
    return HttpResponse.json(withCurrentBalance(fixtures, created), { status: 201 });
  }),
  http.put(
    `/api/bank-accounts/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateBankAccountDto;
      const index = fixtures.bankAccounts.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      const current = fixtures.bankAccounts[index];

      if (
        normalizeBalance(current.initialBalance) !==
          normalizeBalance(payload.initialBalance) ||
        current.initialBalanceDate !== payload.initialBalanceDate
      ) {
        return badRequest(
          'Initial bank balance cannot be changed after account creation.',
        );
      }

      fixtures.bankAccounts[index] = {
        ...current,
        accountType: payload.accountType,
        accountGroup: payload.accountGroup,
        name: payload.name,
        active: payload.active,
        financialInstitution: payload.financialInstitution,
        agency: payload.agency,
        accountNumber: payload.accountNumber,
      };

      return HttpResponse.json(
        withCurrentBalance(fixtures, fixtures.bankAccounts[index]),
      );
    },
  ),
  http.delete(`/api/bank-accounts/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    const bankAccountExists = fixtures.bankAccounts.some((item) => item.id === id);

    if (!bankAccountExists || id === undefined) return notFound();

    if (hasFinancialMovements(id)) {
      return badRequest(
        'Bank account cannot be deleted because it has financial movements.',
      );
    }

    fixtures.bankAccounts = fixtures.bankAccounts.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
