import type { InventoryMovementType } from '../../inventory/api/dtos';

export type FinancialTransactionStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELED'
  | 'PARTIAL';

export type FinancialTransactionType = 'INCOME' | 'EXPENSE';

export type AttachmentStorageProvider = 'LOCAL' | 'ONEDRIVE' | 'S3';

export type CashMovementStatus = 'ACTIVE' | 'CANCELED' | 'ADJUSTMENT';

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
  paidAmount?: number;
  remainingAmount?: number;
  itemCount?: number;
  attachmentCount?: number;
  fulfillmentCount?: number;
  items?: FinancialTransactionItemDto[];
  attachments?: FinancialTransactionAttachmentDto[];
  fulfillments?: FinancialTransactionFulfillmentDto[];
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
  active?: boolean;
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
  inventoryMovementId?: number;
  inventoryBatchId?: number;
  stockMovementType?: InventoryMovementType;
  inventoryUnitCost?: number;
}

export interface FinancialTransactionFulfillmentDto {
  id: number;
  financialTransactionId: number;
  bankAccountId: number;
  paymentDate: string;
  amountPaid: number;
  allocations: FinancialTransactionFulfillmentAllocationDto[];
  observation?: string;
  status?: CashMovementStatus;
  cancelId?: number;
}

export interface FinancialTransactionFulfillmentAllocationDto {
  id?: number;
  itemId?: number;
  itemIndex?: number;
  amount: number;
}

export interface BankTransferDto {
  id: number;
  sourceBankAccountId?: number;
  destinationBankAccountId?: number;
  amount: number;
  transferDate: string;
  observation?: string;
  status?: CashMovementStatus;
  cancelId?: number;
}

export type UpdateFinancialTransactionDto = Pick<
  FinancialTransactionDto,
  | 'description'
  | 'counterpartyId'
  | 'issueDate'
  | 'dueDate'
  | 'documentNumber'
  | 'type'
  | 'observation'
  | 'hasNf'
>;
export type CreateFinancialTransactionDto = UpdateFinancialTransactionDto;

export interface CreateFinancialTransactionAttachmentPayloadDto {
  documentTypeId?: number;
  fileIndex: number;
  observation?: string;
}

export interface CreateFinancialTransactionPayloadDto
  extends UpdateFinancialTransactionDto {
  items: CreateFinancialTransactionItemDto[];
  attachments?: CreateFinancialTransactionAttachmentPayloadDto[];
  fulfillments?: CreateFinancialTransactionFulfillmentDto[];
}

export interface CreateFinancialTransactionMultipartDto {
  payload: CreateFinancialTransactionPayloadDto;
  files: File[];
}

export type CreateFinancialTransactionAttachmentDto = Omit<
  FinancialTransactionAttachmentDto,
  | 'id'
  | 'financialTransactionId'
  | 'fileName'
  | 'declaredContentType'
  | 'sizeBytes'
  | 'storageProvider'
  | 'storagePath'
  | 'externalFileId'
  | 'externalParentId'
  | 'webUrl'
  | 'checksumSha256'
  | 'uploadedAt'
  | 'active'
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
  'id' | 'financialTransactionId' | 'status' | 'cancelId'
> & {
  financialTransactionId?: number;
};
export type UpdateFinancialTransactionFulfillmentDto =
  CreateFinancialTransactionFulfillmentDto;

export interface CancelFinancialTransactionDto {
  adjustmentDate?: string;
  observation?: string;
}

export interface CancelFinancialTransactionFulfillmentDto {
  adjustmentDate: string;
  observation?: string;
}

export type CreateBankTransferDto = Omit<BankTransferDto, 'id' | 'status' | 'cancelId'>;
export type UpdateBankTransferDto = CreateBankTransferDto;

export interface CancelBankTransferDto {
  adjustmentDate: string;
  observation?: string;
}
