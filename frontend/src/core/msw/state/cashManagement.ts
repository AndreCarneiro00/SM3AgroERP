import { createBankingFixtures } from '../fixtures/banking';
import { createFinancialFixtures } from '../fixtures/financial';
import type { BankAccountDto } from '../../../domains/banking/api/dtos';
import type {
  BankTransferDto,
  FinancialTransactionAttachmentDto,
  FinancialTransactionDto,
  FinancialTransactionFulfillmentDto,
  FinancialTransactionItemDto,
} from '../../../domains/financial/api/dtos';

export interface CashManagementState {
  bankAccounts: BankAccountDto[];
  financialTransactions: FinancialTransactionDto[];
  financialTransactionAttachments: FinancialTransactionAttachmentDto[];
  financialTransactionItems: FinancialTransactionItemDto[];
  financialTransactionFulfillments: FinancialTransactionFulfillmentDto[];
  bankTransfers: BankTransferDto[];
}

const bankingFixtures = createBankingFixtures();
const financialFixtures = createFinancialFixtures();

export const cashManagementState: CashManagementState = {
  bankAccounts: bankingFixtures.bankAccounts,
  financialTransactions: financialFixtures.financialTransactions,
  financialTransactionAttachments: financialFixtures.financialTransactionAttachments,
  financialTransactionItems: financialFixtures.financialTransactionItems,
  financialTransactionFulfillments: financialFixtures.financialTransactionFulfillments,
  bankTransfers: financialFixtures.bankTransfers,
};
