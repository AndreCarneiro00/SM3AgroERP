// Thin re-export layer — the actual data lives in the json/ files.
// To update mock data, edit the corresponding JSON file directly.
import type {
  IncomeStatementGroup, BaseUnit, ProductFamily, DocumentType,
  CounterpartyType, Segment, ActivityGroup, AdjustmentRootCause,
  UnitOfMeasure, Field, Product, Machine, BankAccount, Counterparty,
  ChartOfAccount, CostCenter, IncomeStatementRelationship, Cut,
  FieldOperation, FieldOperationMachine, FinancialTransaction,
  FinancialTransactionAttachment, FinancialTransactionItem,
  FinancialTransactionFulfillment, BankTransfer, InventoryBatch,
  InventoryMovement, InventoryAdjustment, ProductionBatch,
  FieldOperationItem,
} from './types';

import _incomeStatementGroups from './json/incomeStatementGroups.json';
import _baseUnits from './json/baseUnits.json';
import _productFamilies from './json/productFamilies.json';
import _documentTypes from './json/documentTypes.json';
import _counterpartyTypes from './json/counterpartyTypes.json';
import _segments from './json/segments.json';
import _activityGroups from './json/activityGroups.json';
import _adjustmentRootCauses from './json/adjustmentRootCauses.json';
import _unitsOfMeasure from './json/unitsOfMeasure.json';
import _fields from './json/fields.json';
import _products from './json/products.json';
import _machines from './json/machines.json';
import _bankAccounts from './json/bankAccounts.json';
import _counterparties from './json/counterparties.json';
import _chartOfAccounts from './json/chartOfAccounts.json';
import _costCenters from './json/costCenters.json';
import _incomeStatementRelationships from './json/incomeStatementRelationships.json';
import _cuts from './json/cuts.json';
import _fieldOperations from './json/fieldOperations.json';
import _fieldOperationMachines from './json/fieldOperationMachines.json';
import _financialTransactions from './json/financialTransactions.json';
import _financialTransactionAttachments from './json/financialTransactionAttachments.json';
import _financialTransactionItems from './json/financialTransactionItems.json';
import _financialTransactionFulfillments from './json/financialTransactionFulfillments.json';
import _bankTransfers from './json/bankTransfers.json';
import _inventoryBatches from './json/inventoryBatches.json';
import _inventoryMovements from './json/inventoryMovements.json';
import _inventoryAdjustments from './json/inventoryAdjustments.json';
import _productionBatches from './json/productionBatches.json';
import _fieldOperationItems from './json/fieldOperationItems.json';

export const incomeStatementGroups = _incomeStatementGroups as IncomeStatementGroup[];
export const baseUnits = _baseUnits as BaseUnit[];
export const productFamilies = _productFamilies as ProductFamily[];
export const documentTypes = _documentTypes as DocumentType[];
export const counterpartyTypes = _counterpartyTypes as CounterpartyType[];
export const segments = _segments as Segment[];
export const activityGroups = _activityGroups as ActivityGroup[];
export const adjustmentRootCauses = _adjustmentRootCauses as AdjustmentRootCause[];
export const unitsOfMeasure = _unitsOfMeasure as UnitOfMeasure[];
export const fields = _fields as Field[];
export const products = _products as Product[];
export const machines = _machines as Machine[];
export const bankAccounts = _bankAccounts as BankAccount[];
export const counterparties = _counterparties as Counterparty[];
export const chartOfAccounts = _chartOfAccounts as ChartOfAccount[];
export const costCenters = _costCenters as CostCenter[];
export const incomeStatementRelationships = _incomeStatementRelationships as IncomeStatementRelationship[];
export const cuts = _cuts as Cut[];
export const fieldOperations = _fieldOperations as FieldOperation[];
export const fieldOperationMachines = _fieldOperationMachines as FieldOperationMachine[];
export const financialTransactions = _financialTransactions as FinancialTransaction[];
export const financialTransactionAttachments = _financialTransactionAttachments as FinancialTransactionAttachment[];
export const financialTransactionItems = _financialTransactionItems as FinancialTransactionItem[];
export const financialTransactionFulfillments = _financialTransactionFulfillments as FinancialTransactionFulfillment[];
export const bankTransfers = _bankTransfers as BankTransfer[];
export const inventoryBatches = _inventoryBatches as InventoryBatch[];
export const inventoryMovements = _inventoryMovements as InventoryMovement[];
export const inventoryAdjustments = _inventoryAdjustments as InventoryAdjustment[];
export const productionBatches = _productionBatches as ProductionBatch[];
export const fieldOperationItems = _fieldOperationItems as FieldOperationItem[];
