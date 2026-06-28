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

export interface AdjustmentRootCause {
  id: number;
  name: string;
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  base_unit_id?: number;
  conversion_factor?: number;
}

export interface Field {
  id: number;
  name: string;
  area_hectares?: number;
}

export type ProductType =
  | 'RAW_MATERIAL'
  | 'FINISHED_GOOD'
  | 'CONSUMABLE'
  | 'SPARE_PART'
  | 'SERVICE';

export interface Product {
  id: number;
  name: string;
  unit_id?: number;
  product_family_id?: number;
  product_type: ProductType;
  active: boolean;
}

export type MachineType =
  | 'TRACTOR'
  | 'BALER'
  | 'MOWER'
  | 'SPRAYER'
  | 'FERTILIZER_SPREADER'
  | 'IRRIGATION'
  | 'PUMP'
  | 'OTHER';

export interface Machine {
  id: number;
  name: string;
  machine_type: MachineType;
  manufacturer?: string;
  model?: string;
  year?: number;
  active: boolean;
  observation?: string;
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

export interface Counterparty {
  id: number;
  counterparty_type_id?: number;
  legal_name: string;
  trade_name?: string;
  city?: string;
  state?: string;
  phone_number?: string;
  email?: string;
  document?: string;
  document_type?: 'CPF' | 'CNPJ';
  segment_id?: number;
  active: boolean;
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

export interface Cut {
  id: number;
  field_id?: number;
  product_family_id?: number;
  cut_date?: string;
  cut_number?: number;
  observation?: string;
  days_since_last_cut?: number;
}

export type FieldOperationType =
  | 'PLANTING'
  | 'FERTILIZATION'
  | 'DEFENSIVE_APPLICATION'
  | 'IRRIGATION'
  | 'SOIL_CORRECTION'
  | 'MOWING'
  | 'BALING'
  | 'FIELD_REFORM'
  | 'OTHER';

export interface FieldOperation {
  id: number;
  field_id?: number;
  cut_id?: number;
  operation_type: FieldOperationType;
  operation_date: string;
  status: 'PLANNED' | 'DONE' | 'CANCELED';
  observation?: string;
}

export interface FieldOperationMachine {
  id: number;
  field_operation_id?: number;
  machine_id?: number;
  hours_worked?: number;
  observation?: string;
}

export interface FinancialTransaction {
  id: number;
  description?: string;
  counterparty_id?: number;
  issue_date?: string;
  due_date?: string;
  document_number?: string;
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'PARTIAL';
  type: 'INCOME' | 'EXPENSE';
  observation?: string;
  has_nf?: boolean;
  total_amount?: number;
}

export interface FinancialTransactionAttachment {
  id: number;
  financial_transaction_id?: number;
  file_name: string;
  declared_content_type?: string;
  size_bytes?: number;
  document_type_id?: number;
  storage_provider: 'LOCAL' | 'ONEDRIVE';
  storage_path?: string;
  external_file_id?: string;
  external_parent_id?: string;
  web_url?: string;
  checksum_sha256?: string;
  uploaded_at?: string;
  active: boolean;
  observation?: string;
}

export interface FinancialTransactionItem {
  id: number;
  financial_transaction_id?: number;
  chart_of_account_id?: number;
  cost_center_id?: number;
  quantity?: number;
  unit_price?: number;
  amount?: number;
  product_id?: number;
}

export interface FinancialTransactionFulfillment {
  id: number;
  financial_transaction_id: number;
  bank_account_id: number;
  payment_date: string;
  amount_paid: number;
  observation?: string;
}

export interface BankTransfer {
  id: number;
  source_bank_account_id?: number;
  destination_bank_account_id?: number;
  amount: number;
  transfer_date: string;
  observation?: string;
}

export interface InventoryBatch {
  id: number;
  product_id?: number;
  code?: string;
  batch_date?: string;
  status?: 'ACTIVE' | 'CONSUMED' | 'SOLD' | 'CANCELED';
  unit_cost?: number;
  quantity?: number;
}

export type InventoryMovementType =
  | 'PURCHASE_IN'
  | 'PRODUCTION_IN'
  | 'SALE_OUT'
  | 'CONSUMPTION_OUT'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface InventoryMovement {
  id: number;
  batch_id?: number;
  movement_type?: InventoryMovementType;
  quantity?: number;
  unit_cost?: number;
  movement_date?: string;
  financial_transaction_item_id?: number;
}

export interface InventoryAdjustment {
  id: number;
  type: 'POSITIVE' | 'NEGATIVE';
  root_cause_id?: number;
  observation?: string;
  inventory_movement_id?: number;
}

export interface ProductionBatch {
  id: number;
  inventory_batch_id?: number;
  quality_grade?: string;
  cut_id?: number;
  observation?: string;
}

export interface FieldOperationItem {
  id: number;
  field_operation_id?: number;
  product_id?: number;
  quantity?: number;
  unit_cost?: number;
  amount?: number;
  inventory_movement_id?: number;
  observation?: string;
}

export type PageId =
  | 'dashboard'
  | 'financial-transactions'
  | 'financial-items'
  | 'financial-attachments'
  | 'financial-fulfillments'
  | 'financial-bank-transfers'
  | 'accounting-chart'
  | 'accounting-cost-centers'
  | 'accounting-dre'
  | 'accounting-dre-relationships'
  | 'agricultural-fields'
  | 'agricultural-machines'
  | 'agricultural-cuts'
  | 'agricultural-operations'
  | 'agricultural-operation-machines'
  | 'agricultural-operation-items'
  | 'agricultural-production-batches'
  | 'products-list'
  | 'products-families'
  | 'products-units'
  | 'inventory-batches'
  | 'inventory-movements'
  | 'inventory-adjustments'
  | 'banking-accounts'
  | 'master-counterparties'
  | 'master-counterparty-types'
  | 'master-segments'
  | 'master-activity-groups'
  | 'master-document-types'
  | 'master-adjustment-root-causes';
