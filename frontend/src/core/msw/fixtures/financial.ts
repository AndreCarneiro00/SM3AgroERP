import bankTransfersJson from '../../../app/data/json/bankTransfers.json';
import financialTransactionAttachmentsJson from '../../../app/data/json/financialTransactionAttachments.json';
import financialTransactionFulfillmentsJson from '../../../app/data/json/financialTransactionFulfillments.json';
import financialTransactionItemsJson from '../../../app/data/json/financialTransactionItems.json';
import financialTransactionsJson from '../../../app/data/json/financialTransactions.json';
import type {
  BankTransferDto,
  FinancialTransactionAttachmentDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionItemDto,
} from '../../../domains/financial/api/dtos';

export function createFinancialFixtures() {
  return {
    financialTransactions: structuredClone(
      financialTransactionsJson,
    ) as FinancialTransactionDto[],
    financialTransactionAttachments: structuredClone(
      financialTransactionAttachmentsJson,
    ) as FinancialTransactionAttachmentDto[],
    financialTransactionItems: structuredClone(
      financialTransactionItemsJson,
    ) as FinancialTransactionItemDto[],
    financialTransactionFulfillments: structuredClone(
      financialTransactionFulfillmentsJson,
    ) as FinancialTransactionFulfillmentDto[],
    bankTransfers: structuredClone(bankTransfersJson) as BankTransferDto[],
  };
}
