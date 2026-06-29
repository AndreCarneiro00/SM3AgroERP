export type FinancialTransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELED'
  | 'PARTIAL';

export type FinancialTransactionType = 'INCOME' | 'EXPENSE';

export type AttachmentStorageProvider = 'LOCAL' | 'ONEDRIVE';

export interface FinancialTransactionDto {
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

export interface FinancialTransactionAttachmentDto {
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

export interface FinancialTransactionItemDto {
  id: number;
  financialTransactionId?: number;
  chartOfAccountId?: number;
  costCenterId?: number;
  quantity?: number;
  unitPrice?: number;
  amount?: number;
  productId?: number;
}

export interface FinancialTransactionFulfillmentDto {
  id: number;
  financialTransactionId: number;
  bankAccountId: number;
  paymentDate: string;
  amountPaid: number;
  observation?: string;
}

export interface BankTransferDto {
  id: number;
  sourceBankAccountId?: number;
  destinationBankAccountId?: number;
  amount: number;
  transferDate: string;
  observation?: string;
}

export type CreateFinancialTransactionDto = Omit<FinancialTransactionDto, 'id'>;
export type UpdateFinancialTransactionDto = CreateFinancialTransactionDto;

export type CreateFinancialTransactionAttachmentDto = Omit<
  FinancialTransactionAttachmentDto,
  'id'
>;
export type UpdateFinancialTransactionAttachmentDto =
  CreateFinancialTransactionAttachmentDto;

export type CreateFinancialTransactionItemDto = Omit<
  FinancialTransactionItemDto,
  'id'
>;
export type UpdateFinancialTransactionItemDto = CreateFinancialTransactionItemDto;

export type CreateFinancialTransactionFulfillmentDto = Omit<
  FinancialTransactionFulfillmentDto,
  'id'
>;
export type UpdateFinancialTransactionFulfillmentDto =
  CreateFinancialTransactionFulfillmentDto;

export type CreateBankTransferDto = Omit<BankTransferDto, 'id'>;
export type UpdateBankTransferDto = CreateBankTransferDto;
