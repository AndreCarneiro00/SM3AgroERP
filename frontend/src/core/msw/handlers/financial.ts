import { HttpResponse, http } from 'msw';
import type { RequestHandler } from 'msw';
import type {
  BankTransferDto,
  CreateBankTransferDto,
  CreateFinancialTransactionAttachmentDto,
  CreateFinancialTransactionDto,
  CreateFinancialTransactionFulfillmentDto,
  CreateFinancialTransactionItemDto,
  FinancialTransactionAttachmentDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionItemDto,
} from '../../../domains/financial/api/dtos';
import { createFinancialFixtures } from '../fixtures/financial';

const fixtures = createFinancialFixtures();

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

function recalculateTransactionStatus(financialTransactionId: number) {
  const financialTransaction = fixtures.financialTransactions.find(
    (item) => item.id === financialTransactionId,
  );

  if (!financialTransaction || financialTransaction.status === 'CANCELED') {
    return;
  }

  const paidAmount = fixtures.financialTransactionFulfillments
    .filter((item) => item.financialTransactionId === financialTransactionId)
    .reduce((sum, item) => sum + item.amountPaid, 0);

  if (paidAmount <= 0) {
    financialTransaction.status = 'PENDING';
    return;
  }

  financialTransaction.status =
    paidAmount >= (financialTransaction.totalAmount ?? 0) ? 'PAID' : 'PARTIAL';
}

export const financialHandlers: RequestHandler[] = [
  http.get(`/api/financial-transactions`, () => {
    return HttpResponse.json(fixtures.financialTransactions);
  }),
  http.post(`/api/financial-transactions`, async ({ request }) => {
    const payload = (await request.json()) as CreateFinancialTransactionDto;
    const created: FinancialTransactionDto = {
      id: nextId(fixtures.financialTransactions),
      description: payload.description,
      counterpartyId: payload.counterpartyId,
      issueDate: payload.issueDate,
      dueDate: payload.dueDate,
      documentNumber: payload.documentNumber,
      status: payload.status,
      type: payload.type,
      observation: payload.observation,
      hasNf: payload.hasNf,
      totalAmount: payload.totalAmount,
    };
    fixtures.financialTransactions.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(
    `/api/financial-transactions/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateFinancialTransactionDto;
      const index = fixtures.financialTransactions.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.financialTransactions[index] = {
        ...fixtures.financialTransactions[index],
        description: payload.description,
        counterpartyId: payload.counterpartyId,
        issueDate: payload.issueDate,
        dueDate: payload.dueDate,
        documentNumber: payload.documentNumber,
        status: payload.status,
        type: payload.type,
        observation: payload.observation,
        hasNf: payload.hasNf,
        totalAmount: payload.totalAmount,
      };

      return HttpResponse.json(fixtures.financialTransactions[index]);
    },
  ),
  http.delete(`/api/financial-transactions/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.financialTransactions = fixtures.financialTransactions.filter(
      (item) => item.id !== id,
    );
    fixtures.financialTransactionAttachments =
      fixtures.financialTransactionAttachments.filter(
        (item) => item.financialTransactionId !== id,
      );
    fixtures.financialTransactionItems = fixtures.financialTransactionItems.filter(
      (item) => item.financialTransactionId !== id,
    );
    fixtures.financialTransactionFulfillments =
      fixtures.financialTransactionFulfillments.filter(
        (item) => item.financialTransactionId !== id,
      );
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`/api/financial-transaction-attachments`, () => {
    return HttpResponse.json(fixtures.financialTransactionAttachments);
  }),
  http.post(
    `/api/financial-transaction-attachments`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateFinancialTransactionAttachmentDto;
      const created: FinancialTransactionAttachmentDto = {
        id: nextId(fixtures.financialTransactionAttachments),
        financialTransactionId: payload.financialTransactionId,
        fileName: payload.fileName,
        declaredContentType: payload.declaredContentType,
        sizeBytes: payload.sizeBytes,
        documentTypeId: payload.documentTypeId,
        storageProvider: payload.storageProvider,
        storagePath: payload.storagePath,
        externalFileId: payload.externalFileId,
        externalParentId: payload.externalParentId,
        webUrl: payload.webUrl,
        checksumSha256: payload.checksumSha256,
        uploadedAt: payload.uploadedAt,
        active: payload.active,
        observation: payload.observation,
      };
      fixtures.financialTransactionAttachments.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/financial-transaction-attachments/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateFinancialTransactionAttachmentDto;
      const index = fixtures.financialTransactionAttachments.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.financialTransactionAttachments[index] = {
        ...fixtures.financialTransactionAttachments[index],
        financialTransactionId: payload.financialTransactionId,
        fileName: payload.fileName,
        declaredContentType: payload.declaredContentType,
        sizeBytes: payload.sizeBytes,
        documentTypeId: payload.documentTypeId,
        storageProvider: payload.storageProvider,
        storagePath: payload.storagePath,
        externalFileId: payload.externalFileId,
        externalParentId: payload.externalParentId,
        webUrl: payload.webUrl,
        checksumSha256: payload.checksumSha256,
        uploadedAt: payload.uploadedAt,
        active: payload.active,
        observation: payload.observation,
      };

      return HttpResponse.json(fixtures.financialTransactionAttachments[index]);
    },
  ),
  http.delete(
    `/api/financial-transaction-attachments/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.financialTransactionAttachments =
        fixtures.financialTransactionAttachments.filter((item) => item.id !== id);
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/financial-transaction-items`, () => {
    return HttpResponse.json(fixtures.financialTransactionItems);
  }),
  http.post(
    `/api/financial-transaction-items`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateFinancialTransactionItemDto;
      const created: FinancialTransactionItemDto = {
        id: nextId(fixtures.financialTransactionItems),
        financialTransactionId: payload.financialTransactionId,
        chartOfAccountId: payload.chartOfAccountId,
        costCenterId: payload.costCenterId,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
        amount: payload.amount,
        productId: payload.productId,
      };
      fixtures.financialTransactionItems.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/financial-transaction-items/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateFinancialTransactionItemDto;
      const index = fixtures.financialTransactionItems.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      fixtures.financialTransactionItems[index] = {
        ...fixtures.financialTransactionItems[index],
        financialTransactionId: payload.financialTransactionId,
        chartOfAccountId: payload.chartOfAccountId,
        costCenterId: payload.costCenterId,
        quantity: payload.quantity,
        unitPrice: payload.unitPrice,
        amount: payload.amount,
        productId: payload.productId,
      };

      return HttpResponse.json(fixtures.financialTransactionItems[index]);
    },
  ),
  http.delete(
    `/api/financial-transaction-items/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      fixtures.financialTransactionItems = fixtures.financialTransactionItems.filter(
        (item) => item.id !== id,
      );
      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/financial-transaction-fulfillments`, () => {
    return HttpResponse.json(fixtures.financialTransactionFulfillments);
  }),
  http.post(
    `/api/financial-transaction-fulfillments`,
    async ({ request }) => {
      const payload = (await request.json()) as CreateFinancialTransactionFulfillmentDto;
      const created: FinancialTransactionFulfillmentDto = {
        id: nextId(fixtures.financialTransactionFulfillments),
        financialTransactionId: payload.financialTransactionId,
        bankAccountId: payload.bankAccountId,
        paymentDate: payload.paymentDate,
        amountPaid: payload.amountPaid,
        observation: payload.observation,
      };
      fixtures.financialTransactionFulfillments.push(created);
      recalculateTransactionStatus(created.financialTransactionId);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
  http.put(
    `/api/financial-transaction-fulfillments/:id`,
    async ({ params, request }) => {
      const id = parseId(String(params.id));
      const payload = (await request.json()) as CreateFinancialTransactionFulfillmentDto;
      const index = fixtures.financialTransactionFulfillments.findIndex(
        (item) => item.id === id,
      );

      if (index < 0) return notFound();

      const previousTransactionId =
        fixtures.financialTransactionFulfillments[index].financialTransactionId;

      fixtures.financialTransactionFulfillments[index] = {
        ...fixtures.financialTransactionFulfillments[index],
        financialTransactionId: payload.financialTransactionId,
        bankAccountId: payload.bankAccountId,
        paymentDate: payload.paymentDate,
        amountPaid: payload.amountPaid,
        observation: payload.observation,
      };

      recalculateTransactionStatus(previousTransactionId);
      recalculateTransactionStatus(payload.financialTransactionId);

      return HttpResponse.json(fixtures.financialTransactionFulfillments[index]);
    },
  ),
  http.delete(
    `/api/financial-transaction-fulfillments/:id`,
    ({ params }) => {
      const id = parseId(String(params.id));
      const fulfillment = fixtures.financialTransactionFulfillments.find(
        (item) => item.id === id,
      );

      fixtures.financialTransactionFulfillments =
        fixtures.financialTransactionFulfillments.filter((item) => item.id !== id);

      if (fulfillment) {
        recalculateTransactionStatus(fulfillment.financialTransactionId);
      }

      return new HttpResponse(null, { status: 204 });
    },
  ),

  http.get(`/api/bank-transfers`, () => {
    return HttpResponse.json(fixtures.bankTransfers);
  }),
  http.post(`/api/bank-transfers`, async ({ request }) => {
    const payload = (await request.json()) as CreateBankTransferDto;
    const created: BankTransferDto = {
      id: nextId(fixtures.bankTransfers),
      sourceBankAccountId: payload.sourceBankAccountId,
      destinationBankAccountId: payload.destinationBankAccountId,
      amount: payload.amount,
      transferDate: payload.transferDate,
      observation: payload.observation,
    };
    fixtures.bankTransfers.push(created);
    return HttpResponse.json(created, { status: 201 });
  }),
  http.put(`/api/bank-transfers/:id`, async ({ params, request }) => {
    const id = parseId(String(params.id));
    const payload = (await request.json()) as CreateBankTransferDto;
    const index = fixtures.bankTransfers.findIndex((item) => item.id === id);

    if (index < 0) return notFound();

    fixtures.bankTransfers[index] = {
      ...fixtures.bankTransfers[index],
      sourceBankAccountId: payload.sourceBankAccountId,
      destinationBankAccountId: payload.destinationBankAccountId,
      amount: payload.amount,
      transferDate: payload.transferDate,
      observation: payload.observation,
    };

    return HttpResponse.json(fixtures.bankTransfers[index]);
  }),
  http.delete(`/api/bank-transfers/:id`, ({ params }) => {
    const id = parseId(String(params.id));
    fixtures.bankTransfers = fixtures.bankTransfers.filter((item) => item.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),
];
