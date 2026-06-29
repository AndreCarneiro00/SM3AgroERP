import type { EntityCollection } from '../../../core/collections/types';
import type {
  AttachmentStorageProvider,
  FinancialTransactionStatus,
  FinancialTransactionType,
} from '../api/dtos';

export interface FinancialTransaction {
  id: number;
  description?: string;
  counterpartyId?: number;
  issueDate?: string;
  dueDate?: string;
  documentNumber?: string;
  status: FinancialTransactionStatus;
  type: FinancialTransactionType;
  observation?: string;
  hasNf?: boolean;
  totalAmount?: number;
}

export interface FinancialTransactionAttachment {
  id: number;
  financialTransactionId?: number;
  fileName: string;
  declaredContentType?: string;
  sizeBytes?: number;
  documentTypeId?: number;
  storageProvider: AttachmentStorageProvider;
  storagePath?: string;
  externalFileId?: string;
  externalParentId?: string;
  webUrl?: string;
  checksumSha256?: string;
  uploadedAt?: string;
  active: boolean;
  observation?: string;
}

export interface FinancialTransactionItem {
  id: number;
  financialTransactionId?: number;
  chartOfAccountId?: number;
  costCenterId?: number;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  productId?: number;
}

export interface FinancialTransactionFulfillment {
  id: number;
  financialTransactionId: number;
  bankAccountId: number;
  paymentDate: string;
  amountPaid: number;
  observation?: string;
}

export interface BankTransfer {
  id: number;
  sourceBankAccountId?: number;
  destinationBankAccountId?: number;
  amount: number;
  transferDate: string;
  observation?: string;
}

export interface FinancialCatalog {
  financialTransactions: EntityCollection<FinancialTransaction>;
  financialTransactionAttachments: EntityCollection<FinancialTransactionAttachment>;
  financialTransactionItems: EntityCollection<FinancialTransactionItem>;
  financialTransactionFulfillments: EntityCollection<FinancialTransactionFulfillment>;
  bankTransfers: EntityCollection<BankTransfer>;
}

export interface FinancialTransactionInput {
  description?: string;
  counterpartyId?: number;
  issueDate?: string;
  dueDate?: string;
  documentNumber?: string;
  status: FinancialTransactionStatus;
  type: FinancialTransactionType;
  observation?: string;
  hasNf?: boolean;
  totalAmount?: number;
}

export interface FinancialTransactionAttachmentInput {
  financialTransactionId?: number;
  fileName: string;
  declaredContentType?: string;
  sizeBytes?: number;
  documentTypeId?: number;
  storageProvider: AttachmentStorageProvider;
  storagePath?: string;
  externalFileId?: string;
  externalParentId?: string;
  webUrl?: string;
  checksumSha256?: string;
  uploadedAt?: string;
  active: boolean;
  observation?: string;
}

export interface FinancialTransactionItemInput {
  financialTransactionId?: number;
  chartOfAccountId?: number;
  costCenterId?: number;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  productId?: number;
}

export interface FinancialTransactionFulfillmentInput {
  financialTransactionId: number;
  bankAccountId: number;
  paymentDate: string;
  amountPaid: number;
  observation?: string;
}

export interface BankTransferInput {
  sourceBankAccountId?: number;
  destinationBankAccountId?: number;
  amount: number;
  transferDate: string;
  observation?: string;
}
