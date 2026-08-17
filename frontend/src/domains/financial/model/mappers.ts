import { normalizeById } from '../../../core/collections/normalize';
import type {
  BankTransferDto,
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
} from '../api/dtos';
import type {
  BankTransfer,
  BankTransferInput,
  CreateFinancialTransactionInput,
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
    paidAmount: dto.paidAmount,
    remainingAmount: dto.remainingAmount,
    itemCount: dto.itemCount,
    attachmentCount: dto.attachmentCount,
    fulfillmentCount: dto.fulfillmentCount,
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
    active: dto.active ?? true,
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
    inventoryMovementId: dto.inventoryMovementId,
    inventoryBatchId: dto.inventoryBatchId,
    stockMovementType: dto.stockMovementType,
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
    allocations: dto.allocations ?? [],
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
    type: input.type,
    observation: input.observation,
    hasNf: input.hasNf,
  };
}

export function mapCreateFinancialTransactionInputToMultipartDto(
  input: CreateFinancialTransactionInput,
): CreateFinancialTransactionMultipartDto {
  const attachmentsWithFiles = (input.attachments ?? []).filter(
    (attachment) => !!attachment.file,
  );

  return {
    payload: {
      ...mapFinancialTransactionInputToDto(input),
      items: input.items.map(mapFinancialTransactionItemInputToDto),
      attachments: attachmentsWithFiles.map((attachment, fileIndex) => ({
        documentTypeId: attachment.documentTypeId,
        fileIndex,
        observation: attachment.observation,
      })),
      fulfillments: (input.fulfillments ?? []).map(
        mapFinancialTransactionFulfillmentInputToDto,
      ),
    },
    files: attachmentsWithFiles.map((attachment) => attachment.file as File),
  };
}

export function mapFinancialTransactionAttachmentInputToDto(
  input: FinancialTransactionAttachmentInput,
): CreateFinancialTransactionAttachmentDto {
  return {
    documentTypeId: input.documentTypeId,
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
    inventoryBatchId: input.inventoryBatchId,
    inventoryUnitCost: input.inventoryUnitCost,
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
    allocations: input.allocations,
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
  financialTransactionAttachments?: FinancialTransactionAttachmentDto[];
  financialTransactionItems?: FinancialTransactionItemDto[];
  financialTransactionFulfillments?: FinancialTransactionFulfillmentDto[];
  bankTransfers: BankTransferDto[];
}): FinancialCatalog {
  const financialTransactions = params.financialTransactions.map(
    mapFinancialTransactionDto,
  );
  const nestedAttachments = params.financialTransactions.flatMap(
    (financialTransaction) =>
      (financialTransaction.attachments ?? []).map((attachment) => ({
        ...attachment,
        financialTransactionId: financialTransaction.id,
      })),
  );
  const nestedItems = params.financialTransactions.flatMap(
    (financialTransaction) =>
      (financialTransaction.items ?? []).map((item) => ({
        ...item,
        financialTransactionId: financialTransaction.id,
      })),
  );
  const nestedFulfillments = params.financialTransactions.flatMap(
    (financialTransaction) =>
      (financialTransaction.fulfillments ?? []).map((fulfillment) => ({
        ...fulfillment,
        financialTransactionId: financialTransaction.id,
      })),
  );
  const financialTransactionAttachments =
    (params.financialTransactionAttachments ?? nestedAttachments).map(
      mapFinancialTransactionAttachmentDto,
    );
  const financialTransactionItems = (
    params.financialTransactionItems ?? nestedItems
  ).map(
    mapFinancialTransactionItemDto,
  );
  const financialTransactionFulfillments =
    (params.financialTransactionFulfillments ?? nestedFulfillments).map(
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
