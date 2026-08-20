import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
import type { FinancialDateRange } from '../model/dateRange';
import type {
  BankTransferDto,
  CancelBankTransferDto,
  CancelFinancialTransactionDto,
  CancelFinancialTransactionFulfillmentDto,
  CreateBankTransferDto,
  CreateFinancialTransactionMultipartDto,
  CreateFinancialTransactionAttachmentDto,
  CreateFinancialTransactionDto,
  CreateFinancialTransactionFulfillmentDto,
  CreateFinancialTransactionItemDto,
  FinancialTransactionAttachmentDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionItemDto,
  UpdateBankTransferDto,
  UpdateFinancialTransactionAttachmentDto,
  UpdateFinancialTransactionDto,
  UpdateFinancialTransactionFulfillmentDto,
  UpdateFinancialTransactionItemDto,
} from './dtos';

const FINANCIAL_TRANSACTIONS_API_BASE = {
  mock: '/api/financial-transactions',
  api: '/financial-transactions',
} as const;
const BANK_TRANSFERS_API_BASE = {
  mock: '/api/bank-transfers',
  api: '/bank-transfers',
} as const;

function transactionPath(id: number) {
  return resolveResourceItemPath(FINANCIAL_TRANSACTIONS_API_BASE, id);
}

function withDateRange(path: string, dateRange?: FinancialDateRange) {
  const searchParams = new URLSearchParams();

  if (dateRange?.startDate) {
    searchParams.set('startDate', dateRange.startDate);
  }

  if (dateRange?.endDate) {
    searchParams.set('endDate', dateRange.endDate);
  }

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function appendJsonPart(formData: FormData, name: string, payload: unknown) {
  formData.append(
    name,
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  );
}

function createTransactionFormData(payload: CreateFinancialTransactionMultipartDto) {
  const formData = new FormData();
  appendJsonPart(formData, 'payload', payload.payload);
  payload.files.forEach((file) => formData.append('files', file, file.name));
  return formData;
}

function requireTransactionId(financialTransactionId?: number) {
  if (!financialTransactionId) {
    throw new Error('financialTransactionId is required.');
  }

  return financialTransactionId;
}

async function listFinancialTransactionDetails(dateRange?: FinancialDateRange) {
  const transactions = await httpListRequest<FinancialTransactionDto>(
    withDateRange(resolveResourcePath(FINANCIAL_TRANSACTIONS_API_BASE), dateRange),
  );

  return Promise.all(
    transactions.map((transaction) =>
      httpRequest<FinancialTransactionDto>(transactionPath(transaction.id)),
    ),
  );
}

export const financialRepository = {
  listFinancialTransactions: (dateRange?: FinancialDateRange) =>
    httpListRequest<FinancialTransactionDto>(
      withDateRange(resolveResourcePath(FINANCIAL_TRANSACTIONS_API_BASE), dateRange),
    ),
  listFinancialTransactionDetails,
  findFinancialTransaction: (id: number) =>
    httpRequest<FinancialTransactionDto>(transactionPath(id)),
  createFinancialTransaction: (payload: CreateFinancialTransactionMultipartDto) =>
    httpRequest<FinancialTransactionDto>(
      resolveResourcePath(FINANCIAL_TRANSACTIONS_API_BASE),
      {
        method: 'POST',
        body: createTransactionFormData(payload),
      },
    ),
  updateFinancialTransaction: (
    id: number,
    payload: UpdateFinancialTransactionDto,
  ) =>
    httpRequest<FinancialTransactionDto>(
      transactionPath(id),
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    ),
  deleteFinancialTransaction: (id: number, payload?: CancelFinancialTransactionDto) =>
    httpRequest<FinancialTransactionDto>(
      `${transactionPath(id)}/cancel`,
      {
        method: 'POST',
        body: payload ? JSON.stringify(payload) : undefined,
      },
    ),

  listFinancialTransactionAttachments: () =>
    listFinancialTransactionDetails().then((transactions) =>
      transactions.flatMap((transaction) =>
        (transaction.attachments ?? []).map((attachment) => ({
          ...attachment,
          financialTransactionId: transaction.id,
          active: attachment.active ?? true,
        })),
      ),
    ),
  createFinancialTransactionAttachment: (
    payload: CreateFinancialTransactionAttachmentDto,
    financialTransactionId: number,
    file: File,
  ) => {
    const formData = new FormData();
    appendJsonPart(formData, 'payload', payload);
    formData.append('file', file, file.name);

    return httpRequest<FinancialTransactionAttachmentDto>(
      `${transactionPath(financialTransactionId)}/attachments`,
      {
        method: 'POST',
        body: formData,
      },
    ).then((attachment) => ({
      ...attachment,
      financialTransactionId,
      active: attachment.active ?? true,
    }));
  },
  updateFinancialTransactionAttachment: (
    id: number,
    financialTransactionId: number,
    payload: UpdateFinancialTransactionAttachmentDto,
  ) =>
    httpRequest<FinancialTransactionAttachmentDto>(
      `${transactionPath(financialTransactionId)}/attachments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    ).then((attachment) => ({
      ...attachment,
      financialTransactionId,
      active: attachment.active ?? true,
    })),
  replaceFinancialTransactionAttachmentFile: (
    financialTransactionId: number,
    id: number,
    file: File,
  ) => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return httpRequest<FinancialTransactionAttachmentDto>(
      `${transactionPath(financialTransactionId)}/attachments/${id}/file`,
      {
        method: 'PUT',
        body: formData,
      },
    ).then((attachment) => ({
      ...attachment,
      financialTransactionId,
      active: attachment.active ?? true,
    }));
  },
  deleteFinancialTransactionAttachment: (
    financialTransactionId: number,
    id: number,
  ) =>
    httpRequest<void>(
      `${transactionPath(financialTransactionId)}/attachments/${id}`,
      {
        method: 'DELETE',
      },
    ),

  listFinancialTransactionItems: () =>
    listFinancialTransactionDetails().then((transactions) =>
      transactions.flatMap((transaction) =>
        (transaction.items ?? []).map((item) => ({
          ...item,
          financialTransactionId: transaction.id,
        })),
      ),
    ),
  createFinancialTransactionItem: (payload: CreateFinancialTransactionItemDto) => {
    const financialTransactionId = requireTransactionId(
      payload.financialTransactionId,
    );
    const { financialTransactionId: _, ...body } = payload;

    return httpRequest<FinancialTransactionItemDto>(
      `${transactionPath(financialTransactionId)}/items`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ).then((item) => ({ ...item, financialTransactionId }));
  },
  updateFinancialTransactionItem: (
    id: number,
    payload: UpdateFinancialTransactionItemDto,
  ) => {
    const financialTransactionId = requireTransactionId(
      payload.financialTransactionId,
    );
    const { financialTransactionId: _, ...body } = payload;

    return httpRequest<FinancialTransactionItemDto>(
      `${transactionPath(financialTransactionId)}/items/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    ).then((item) => ({ ...item, financialTransactionId }));
  },
  deleteFinancialTransactionItem: (financialTransactionId: number, id: number) =>
    httpRequest<void>(
      `${transactionPath(financialTransactionId)}/items/${id}`,
      {
        method: 'DELETE',
      },
    ),

  listFinancialTransactionFulfillments: () =>
    listFinancialTransactionDetails().then((transactions) =>
      transactions.flatMap((transaction) =>
        (transaction.fulfillments ?? []).map((fulfillment) => ({
          ...fulfillment,
          financialTransactionId: transaction.id,
        })),
      ),
    ),
  createFinancialTransactionFulfillment: (
    payload: CreateFinancialTransactionFulfillmentDto,
  ) => {
    const financialTransactionId = requireTransactionId(
      payload.financialTransactionId,
    );
    const { financialTransactionId: _, ...body } = payload;

    return httpRequest<FinancialTransactionFulfillmentDto>(
      `${transactionPath(financialTransactionId)}/fulfillments`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    ).then((fulfillment) => ({ ...fulfillment, financialTransactionId }));
  },
  updateFinancialTransactionFulfillment: (
    id: number,
    payload: UpdateFinancialTransactionFulfillmentDto,
  ) => {
    const financialTransactionId = requireTransactionId(
      payload.financialTransactionId,
    );
    const { financialTransactionId: _, ...body } = payload;

    return httpRequest<FinancialTransactionFulfillmentDto>(
      `${transactionPath(financialTransactionId)}/fulfillments/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
    ).then((fulfillment) => ({ ...fulfillment, financialTransactionId }));
  },
  deleteFinancialTransactionFulfillment: (
    financialTransactionId: number,
    id: number,
  ) =>
    httpRequest<void>(
      `${transactionPath(financialTransactionId)}/fulfillments/${id}`,
      {
        method: 'DELETE',
      },
    ),
  cancelFinancialTransactionFulfillment: (
    financialTransactionId: number,
    id: number,
    payload: CancelFinancialTransactionFulfillmentDto,
  ) =>
    httpRequest<FinancialTransactionFulfillmentDto>(
      `${transactionPath(financialTransactionId)}/fulfillments/${id}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ).then((fulfillment) => ({ ...fulfillment, financialTransactionId })),

  listBankTransfers: (dateRange?: FinancialDateRange) =>
    httpListRequest<BankTransferDto>(
      withDateRange(resolveResourcePath(BANK_TRANSFERS_API_BASE), dateRange),
    ),
  createBankTransfer: (payload: CreateBankTransferDto) =>
    httpRequest<BankTransferDto>(resolveResourcePath(BANK_TRANSFERS_API_BASE), {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateBankTransfer: (id: number, payload: UpdateBankTransferDto) =>
    httpRequest<BankTransferDto>(resolveResourceItemPath(BANK_TRANSFERS_API_BASE, id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteBankTransfer: (id: number) =>
    httpRequest<void>(resolveResourceItemPath(BANK_TRANSFERS_API_BASE, id), {
      method: 'DELETE',
    }),
  cancelBankTransfer: (id: number, payload: CancelBankTransferDto) =>
    httpRequest<BankTransferDto>(
      `${resolveResourceItemPath(BANK_TRANSFERS_API_BASE, id)}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
};
