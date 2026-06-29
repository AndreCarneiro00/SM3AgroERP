import { httpListRequest, httpRequest } from '../../../core/http/client';
import {
  resolveResourceItemPath,
  resolveResourcePath,
} from '../../../core/http/resourcePath';
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
const FINANCIAL_TRANSACTION_ATTACHMENTS_API_BASE = {
  mock: '/api/financial-transaction-attachments',
  api: '/financial-transaction-attachments',
} as const;
const FINANCIAL_TRANSACTION_ITEMS_API_BASE = {
  mock: '/api/financial-transaction-items',
  api: '/financial-transaction-items',
} as const;
const FINANCIAL_TRANSACTION_FULFILLMENTS_API_BASE = {
  mock: '/api/financial-transaction-fulfillments',
  api: '/financial-transaction-fulfillments',
} as const;
const BANK_TRANSFERS_API_BASE = {
  mock: '/api/bank-transfers',
  api: '/bank-transfers',
} as const;

export const financialRepository = {
  listFinancialTransactions: () =>
    httpListRequest<FinancialTransactionDto>(
      resolveResourcePath(FINANCIAL_TRANSACTIONS_API_BASE),
    ),
  createFinancialTransaction: (payload: CreateFinancialTransactionDto) =>
    httpRequest<FinancialTransactionDto>(
      resolveResourcePath(FINANCIAL_TRANSACTIONS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFinancialTransaction: (
    id: number,
    payload: UpdateFinancialTransactionDto,
  ) =>
    httpRequest<FinancialTransactionDto>(
      resolveResourceItemPath(FINANCIAL_TRANSACTIONS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFinancialTransaction: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FINANCIAL_TRANSACTIONS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listFinancialTransactionAttachments: () =>
    httpListRequest<FinancialTransactionAttachmentDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_ATTACHMENTS_API_BASE),
    ),
  createFinancialTransactionAttachment: (
    payload: CreateFinancialTransactionAttachmentDto,
  ) =>
    httpRequest<FinancialTransactionAttachmentDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_ATTACHMENTS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFinancialTransactionAttachment: (
    id: number,
    payload: UpdateFinancialTransactionAttachmentDto,
  ) =>
    httpRequest<FinancialTransactionAttachmentDto>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_ATTACHMENTS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFinancialTransactionAttachment: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_ATTACHMENTS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listFinancialTransactionItems: () =>
    httpListRequest<FinancialTransactionItemDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_ITEMS_API_BASE),
    ),
  createFinancialTransactionItem: (payload: CreateFinancialTransactionItemDto) =>
    httpRequest<FinancialTransactionItemDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_ITEMS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFinancialTransactionItem: (
    id: number,
    payload: UpdateFinancialTransactionItemDto,
  ) =>
    httpRequest<FinancialTransactionItemDto>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_ITEMS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFinancialTransactionItem: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_ITEMS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listFinancialTransactionFulfillments: () =>
    httpListRequest<FinancialTransactionFulfillmentDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_FULFILLMENTS_API_BASE),
    ),
  createFinancialTransactionFulfillment: (
    payload: CreateFinancialTransactionFulfillmentDto,
  ) =>
    httpRequest<FinancialTransactionFulfillmentDto>(
      resolveResourcePath(FINANCIAL_TRANSACTION_FULFILLMENTS_API_BASE),
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    ),
  updateFinancialTransactionFulfillment: (
    id: number,
    payload: UpdateFinancialTransactionFulfillmentDto,
  ) =>
    httpRequest<FinancialTransactionFulfillmentDto>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_FULFILLMENTS_API_BASE, id),
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
    ),
  deleteFinancialTransactionFulfillment: (id: number) =>
    httpRequest<void>(
      resolveResourceItemPath(FINANCIAL_TRANSACTION_FULFILLMENTS_API_BASE, id),
      {
        method: 'DELETE',
      },
    ),

  listBankTransfers: () =>
    httpListRequest<BankTransferDto>(resolveResourcePath(BANK_TRANSFERS_API_BASE)),
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
};
