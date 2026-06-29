import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import { createBankingFixtures } from '../fixtures/banking';
import type {
  BankAccountDto,
  CreateBankAccountDto,
} from '../../../domains/banking/api/dtos';

const fixtures = createBankingFixtures();

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

export const bankingHandlers: RequestHandler[] = [
  http.get(`/api/bank-accounts`, () => {
    return HttpResponse.json(fixtures.bankAccounts);
  }),
  http.post(`/api/bank-accounts`, async ({ request }) => {
    const payload = (await request.json()) as CreateBankAccountDto;
    const created: BankAccountDto = {
      id: nextId(fixtures.bankAccounts),
      accountType: payload.accountType,
      accountGroup: payload.accountGroup,
      name: payload.name,
      active: payload.active,
      initialBalance: payload.initialBalance,
      initialBalanceDate: payload.initialBalanceDate,
      financialInstitution: payload.financialInstitution,
      agency: payload.agency,
      accountNumber: payload.accountNumber,
    };
    fixtures.bankAccounts.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/bank-accounts/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateBankAccountDto;
      const index = fixtures.bankAccounts.findIndex((item) => item.id === id);

      if (index < 0) return notFound();

      fixtures.bankAccounts[index] = {
        ...fixtures.bankAccounts[index],
        accountType: payload.accountType,
        accountGroup: payload.accountGroup,
        name: payload.name,
        active: payload.active,
        initialBalance: payload.initialBalance,
        initialBalanceDate: payload.initialBalanceDate,
        financialInstitution: payload.financialInstitution,
        agency: payload.agency,
        accountNumber: payload.accountNumber,
      };

      return HttpResponse.json(fixtures.bankAccounts[index]);
    },
  ),
  http.delete(`/api/bank-accounts/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.bankAccounts = fixtures.bankAccounts.filter(
      (item) => item.id !== id,
    );
    return new HttpResponse(null, { status: 204 });
  }),
];
