import { normalizeById } from '../../../core/collections/normalize';
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
} from '../api/dtos';
import type {
  BankTransfer,
  BankTransferInput,
  FinancialCatalog,
  FinancialTransaction,
  FinancialTransactionAttachment,
  FinancialTransactionAttachmentInput,
  FinancialTransactionFulfillment,
  FinancialTransactionFulfillmentInput,
  FinancialTransactionInput,
  FinancialTransactionItem,
  FinancialTransactionItemInput,
} from './entities';

export function mapFinancialTransactionDto(
  dto: FinancialTransactionDto,
): FinancialTransaction {
  return {
    id: dto.id,
    description: dto.description,
    counterpartyId: dto.counterpartyId,
    issueDate: dto.issueDate,
    dueDate: dto.dueDate,
    documentNumber: dto.documentNumber,
    status: dto.status,
    type: dto.type,
    observation: dto.observation,
    hasNf: dto.hasNf,
    totalAmount: dto.totalAmount,
  };
}

export function mapFinancialTransactionAttachmentDto(
  dto: FinancialTransactionAttachmentDto,
): FinancialTransactionAttachment {
  return {
    id: dto.id,
    financialTransactionId: dto.financialTransactionId,
    fileName: dto.fileName,
    declaredContentType: dto.declaredContentType,
    sizeBytes: dto.sizeBytes,
    documentTypeId: dto.documentTypeId,
    storageProvider: dto.storageProvider,
    storagePath: dto.storagePath,
    externalFileId: dto.externalFileId,
    externalParentId: dto.externalParentId,
    webUrl: dto.webUrl,
    checksumSha256: dto.checksumSha256,
    uploadedAt: dto.uploadedAt,
    active: dto.active,
    observation: dto.observation,
  };
}

export function mapFinancialTransactionItemDto(
  dto: FinancialTransactionItemDto,
): FinancialTransactionItem {
  return {
    id: dto.id,
    financialTransactionId: dto.financialTransactionId,
    chartOfAccountId: dto.chartOfAccountId,
    costCenterId: dto.costCenterId,
    quantity: dto.quantity,
    unitPrice: dto.unitPrice,
    amount: dto.amount,
    productId: dto.productId,
  };
}

export function mapFinancialTransactionFulfillmentDto(
  dto: FinancialTransactionFulfillmentDto,
): FinancialTransactionFulfillment {
  return {
    id: dto.id,
    financialTransactionId: dto.financialTransactionId,
    bankAccountId: dto.bankAccountId,
    paymentDate: dto.paymentDate,
    amountPaid: dto.amountPaid,
    observation: dto.observation,
  };
}

export function mapBankTransferDto(dto: BankTransferDto): BankTransfer {
  return {
    id: dto.id,
    sourceBankAccountId: dto.sourceBankAccountId,
    destinationBankAccountId: dto.destinationBankAccountId,
    amount: dto.amount,
    transferDate: dto.transferDate,
    observation: dto.observation,
  };
}

export function mapFinancialTransactionInputToDto(
  input: FinancialTransactionInput,
): CreateFinancialTransactionDto {
  return {
    description: input.description,
    counterpartyId: input.counterpartyId,
    issueDate: input.issueDate,
    dueDate: input.dueDate,
    documentNumber: input.documentNumber,
    status: input.status,
    type: input.type,
    observation: input.observation,
    hasNf: input.hasNf,
    totalAmount: input.totalAmount,
  };
}

export function mapFinancialTransactionAttachmentInputToDto(
  input: FinancialTransactionAttachmentInput,
): CreateFinancialTransactionAttachmentDto {
  return {
    financialTransactionId: input.financialTransactionId,
    fileName: input.fileName,
    declaredContentType: input.declaredContentType,
    sizeBytes: input.sizeBytes,
    documentTypeId: input.documentTypeId,
    storageProvider: input.storageProvider,
    storagePath: input.storagePath,
    externalFileId: input.externalFileId,
    externalParentId: input.externalParentId,
    webUrl: input.webUrl,
    checksumSha256: input.checksumSha256,
    uploadedAt: input.uploadedAt,
    active: input.active,
    observation: input.observation,
  };
}

export function mapFinancialTransactionItemInputToDto(
  input: FinancialTransactionItemInput,
): CreateFinancialTransactionItemDto {
  return {
    financialTransactionId: input.financialTransactionId,
    chartOfAccountId: input.chartOfAccountId,
    costCenterId: input.costCenterId,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    amount: input.amount,
    productId: input.productId,
  };
}

export function mapFinancialTransactionFulfillmentInputToDto(
  input: FinancialTransactionFulfillmentInput,
): CreateFinancialTransactionFulfillmentDto {
  return {
    financialTransactionId: input.financialTransactionId,
    bankAccountId: input.bankAccountId,
    paymentDate: input.paymentDate,
    amountPaid: input.amountPaid,
    observation: input.observation,
  };
}

export function mapBankTransferInputToDto(
  input: BankTransferInput,
): CreateBankTransferDto {
  return {
    sourceBankAccountId: input.sourceBankAccountId,
    destinationBankAccountId: input.destinationBankAccountId,
    amount: input.amount,
    transferDate: input.transferDate,
    observation: input.observation,
  };
}

export function createFinancialCatalog(params: {
  financialTransactions: FinancialTransactionDto[];
  financialTransactionAttachments: FinancialTransactionAttachmentDto[];
  financialTransactionItems: FinancialTransactionItemDto[];
  financialTransactionFulfillments: FinancialTransactionFulfillmentDto[];
  bankTransfers: BankTransferDto[];
}): FinancialCatalog {
  const financialTransactions = params.financialTransactions.map(
    mapFinancialTransactionDto,
  );
  const financialTransactionAttachments =
    params.financialTransactionAttachments.map(
      mapFinancialTransactionAttachmentDto,
    );
  const financialTransactionItems = params.financialTransactionItems.map(
    mapFinancialTransactionItemDto,
  );
  const financialTransactionFulfillments =
    params.financialTransactionFulfillments.map(
      mapFinancialTransactionFulfillmentDto,
    );
  const bankTransfers = params.bankTransfers.map(mapBankTransferDto);

  return {
    financialTransactions: normalizeById(financialTransactions),
    financialTransactionAttachments: normalizeById(
      financialTransactionAttachments,
    ),
    financialTransactionItems: normalizeById(financialTransactionItems),
    financialTransactionFulfillments: normalizeById(
      financialTransactionFulfillments,
    ),
    bankTransfers: normalizeById(bankTransfers),
  };
}
