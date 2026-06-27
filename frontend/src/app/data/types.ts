export interface IncomeStatementGroup {
  id: number;
  name: string;
  display_order?: number;
}

export interface BaseUnit {
  id: number;
  name: string;
}

export interface ProductFamily {
  id: number;
  name: string;
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface CounterpartyType {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface Segment {
  id: number;
  name: string;
}

export interface ActivityGroup {
  id: number;
  name: string;
}

export interface BankAccount {
  id: number;
  account_type?: string;
  account_group?: string;
  name: string;
  active: boolean;
  initial_balance?: number;
  initial_balance_date?: string;
  financial_institution?: string;
  agency?: string;
  account_number?: string;
}

export interface Field {
  id: number;
  name: string;
  area_hectares?: number;
  product_family_id?: number;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  base_unit_id?: number;
  conversion_factor?: number;
}

export interface ChartOfAccount {
  id: number;
  name: string;
  parent_id?: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'MANAGERIAL';
  accepts_transaction?: boolean;
  active: boolean;
  code?: string;
}

export interface Cut {
  id: number;
  field_id?: number;
  cut_date?: string;
  cut_number?: number;
  observation?: string;
  days_since_last_cut?: number;
}

export interface CostCenter {
  id: number;
  name: string;
  description?: string;
  type?: 'CAPEX' | 'OPEX';
  accepts_transaction?: boolean;
  active: boolean;
  parent_id?: number;
  code?: string;
  activity_group_id?: number;
}

export interface IncomeStatementRelationship {
  id: number;
  chart_of_account_id?: number;
  income_statement_group_id?: number;
}

export interface Product {
  id: number;
  name: string;
  unit_id?: number;
  product_family_id?: number;
}

export interface Counterparty {
  id: number;
  counterparty_type_id?: number;
  name: string;
  city?: string;
  state?: string;
  phone_number?: string;
  email?: string;
  document?: string;
  document_type?: 'CPF' | 'CNPJ';
  segment_id?: number;
  active: boolean;
}

export interface BankTransfer {
  id: number;
  source_bank_account_id?: number;
  destination_bank_account_id?: number;
  amount: number;
  transfer_date: string;
  observation?: string;
}

export interface Batch {
  id: number;
  product_id?: number;
  code?: string;
  quality_grade?: string;
  cut_id?: number;
  batch_date?: string;
  status?: string;
  cost?: number;
}

export interface FinancialTransaction {
  id: number;
  description?: string;
  counterparty_id?: number;
  issue_date?: string;
  due_date?: string;
  document_number?: string;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'PARTIAL';
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  observation?: string;
  document_type_id?: number;
  has_NF?: boolean;
  total_amount?: number;
}

export interface FinancialTransactionItem {
  id: number;
  financial_transaction_id?: number;
  chart_of_account_id?: number;
  cost_center_id?: number;
  quantity?: number;
  unity_price?: number;
  amount?: number;
  product_id?: number;
}

export interface InventoryMovement {
  id: number;
  batch_id?: number;
  movement_type?: string;
  quantity?: number;
  unit_cost?: number;
  movement_date?: string;
  financial_transaction_item_id?: number;
}

export interface FinancialTransactionFulfillment {
  id: number;
  financial_transaction_id: number;
  bank_account_id: number;
  payment_date: string;
  amount_paid: number;
  observation?: string;
}

export type PageId =
  | 'dashboard'
  | 'financial-transactions'
  | 'financial-fulfillments'
  | 'financial-bank-transfers'
  | 'accounting-chart'
  | 'accounting-cost-centers'
  | 'accounting-dre'
  | 'agricultural-fields'
  | 'agricultural-cuts'
  | 'agricultural-batches'
  | 'products-list'
  | 'products-families'
  | 'products-units'
  | 'inventory-movements'
  | 'banking-accounts'
  | 'master-counterparties'
  | 'master-counterparty-types'
  | 'master-segments'
  | 'master-activity-groups'
  | 'master-document-types';
