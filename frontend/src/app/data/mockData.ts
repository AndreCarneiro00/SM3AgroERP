// Thin re-export layer — the actual data lives in the json/ files.
// To update mock data, edit the corresponding JSON file directly.
import type {
  IncomeStatementGroup, BaseUnit, ProductFamily, DocumentType,
  CounterpartyType, Segment, ActivityGroup, BankAccount, Field,
  UnitOfMeasure, ChartOfAccount, Cut, CostCenter, Product,
  Counterparty, BankTransfer, Batch, FinancialTransaction,
  FinancialTransactionItem, InventoryMovement, FinancialTransactionFulfillment,
} from './types';

import _incomeStatementGroups       from './json/incomeStatementGroups.json';
import _baseUnits                   from './json/baseUnits.json';
import _productFamilies             from './json/productFamilies.json';
import _documentTypes               from './json/documentTypes.json';
import _counterpartyTypes           from './json/counterpartyTypes.json';
import _segments                    from './json/segments.json';
import _activityGroups              from './json/activityGroups.json';
import _bankAccounts                from './json/bankAccounts.json';
import _fields                      from './json/fields.json';
import _unitsOfMeasure              from './json/unitsOfMeasure.json';
import _chartOfAccounts             from './json/chartOfAccounts.json';
import _cuts                        from './json/cuts.json';
import _costCenters                 from './json/costCenters.json';
import _products                    from './json/products.json';
import _counterparties              from './json/counterparties.json';
import _bankTransfers               from './json/bankTransfers.json';
import _batches                     from './json/batches.json';
import _financialTransactions       from './json/financialTransactions.json';
import _financialTransactionItems   from './json/financialTransactionItems.json';
import _inventoryMovements          from './json/inventoryMovements.json';
import _financialTransactionFulfillments from './json/financialTransactionFulfillments.json';

export const incomeStatementGroups       = _incomeStatementGroups       as IncomeStatementGroup[];
export const baseUnits                   = _baseUnits                   as BaseUnit[];
export const productFamilies             = _productFamilies             as ProductFamily[];
export const documentTypes               = _documentTypes               as DocumentType[];
export const counterpartyTypes           = _counterpartyTypes           as CounterpartyType[];
export const segments                    = _segments                    as Segment[];
export const activityGroups              = _activityGroups              as ActivityGroup[];
export const bankAccounts                = _bankAccounts                as BankAccount[];
export const fields                      = _fields                      as Field[];
export const unitsOfMeasure              = _unitsOfMeasure              as UnitOfMeasure[];
export const chartOfAccounts             = _chartOfAccounts             as ChartOfAccount[];
export const cuts                        = _cuts                        as Cut[];
export const costCenters                 = _costCenters                 as CostCenter[];
export const products                    = _products                    as Product[];
export const counterparties              = _counterparties              as Counterparty[];
export const bankTransfers               = _bankTransfers               as BankTransfer[];
export const batches                     = _batches                     as Batch[];
export const financialTransactions       = _financialTransactions       as FinancialTransaction[];
export const financialTransactionItems   = _financialTransactionItems   as FinancialTransactionItem[];
export const inventoryMovements          = _inventoryMovements          as InventoryMovement[];
export const financialTransactionFulfillments = _financialTransactionFulfillments as FinancialTransactionFulfillment[];
