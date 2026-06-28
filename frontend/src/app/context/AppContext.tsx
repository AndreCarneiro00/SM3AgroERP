import React, { createContext, useContext, useState } from 'react';
import type {
  IncomeStatementGroup, BaseUnit, ProductFamily, DocumentType,
  CounterpartyType, Segment, ActivityGroup, AdjustmentRootCause,
  UnitOfMeasure, Field, Product, Machine, BankAccount, Counterparty,
  ChartOfAccount, CostCenter, IncomeStatementRelationship, Cut,
  FieldOperation, FieldOperationMachine, FinancialTransaction,
  FinancialTransactionAttachment, FinancialTransactionItem,
  FinancialTransactionFulfillment, BankTransfer, InventoryBatch,
  InventoryMovement, InventoryAdjustment, ProductionBatch,
  FieldOperationItem, PageId,
} from '../data/types';
import {
  incomeStatementGroups as initialIncomeStatementGroups,
  baseUnits as initialBaseUnits,
  productFamilies as initialProductFamilies,
  documentTypes as initialDocumentTypes,
  counterpartyTypes as initialCounterpartyTypes,
  segments as initialSegments,
  activityGroups as initialActivityGroups,
  adjustmentRootCauses as initialAdjustmentRootCauses,
  unitsOfMeasure as initialUnitsOfMeasure,
  fields as initialFields,
  products as initialProducts,
  machines as initialMachines,
  bankAccounts as initialBankAccounts,
  counterparties as initialCounterparties,
  chartOfAccounts as initialChartOfAccounts,
  costCenters as initialCostCenters,
  incomeStatementRelationships as initialIncomeStatementRelationships,
  cuts as initialCuts,
  fieldOperations as initialFieldOperations,
  fieldOperationMachines as initialFieldOperationMachines,
  financialTransactions as initialFinancialTransactions,
  financialTransactionAttachments as initialFinancialTransactionAttachments,
  financialTransactionItems as initialFinancialTransactionItems,
  financialTransactionFulfillments as initialFinancialTransactionFulfillments,
  bankTransfers as initialBankTransfers,
  inventoryBatches as initialInventoryBatches,
  inventoryMovements as initialInventoryMovements,
  inventoryAdjustments as initialInventoryAdjustments,
  productionBatches as initialProductionBatches,
  fieldOperationItems as initialFieldOperationItems,
} from '../data/mockData';

interface AppState {
  currentPage: PageId;
  incomeStatementGroups: IncomeStatementGroup[];
  baseUnits: BaseUnit[];
  productFamilies: ProductFamily[];
  documentTypes: DocumentType[];
  counterpartyTypes: CounterpartyType[];
  segments: Segment[];
  activityGroups: ActivityGroup[];
  adjustmentRootCauses: AdjustmentRootCause[];
  unitsOfMeasure: UnitOfMeasure[];
  fields: Field[];
  products: Product[];
  machines: Machine[];
  bankAccounts: BankAccount[];
  counterparties: Counterparty[];
  chartOfAccounts: ChartOfAccount[];
  costCenters: CostCenter[];
  incomeStatementRelationships: IncomeStatementRelationship[];
  cuts: Cut[];
  fieldOperations: FieldOperation[];
  fieldOperationMachines: FieldOperationMachine[];
  financialTransactions: FinancialTransaction[];
  financialTransactionAttachments: FinancialTransactionAttachment[];
  financialTransactionItems: FinancialTransactionItem[];
  fulfillments: FinancialTransactionFulfillment[];
  bankTransfers: BankTransfer[];
  inventoryBatches: InventoryBatch[];
  inventoryMovements: InventoryMovement[];
  inventoryAdjustments: InventoryAdjustment[];
  productionBatches: ProductionBatch[];
  fieldOperationItems: FieldOperationItem[];
}

interface AppContextType extends AppState {
  setCurrentPage: (page: PageId) => void;
  setIncomeStatementGroups: React.Dispatch<React.SetStateAction<IncomeStatementGroup[]>>;
  setBaseUnits: React.Dispatch<React.SetStateAction<BaseUnit[]>>;
  setProductFamilies: React.Dispatch<React.SetStateAction<ProductFamily[]>>;
  setDocumentTypes: React.Dispatch<React.SetStateAction<DocumentType[]>>;
  setCounterpartyTypes: React.Dispatch<React.SetStateAction<CounterpartyType[]>>;
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  setActivityGroups: React.Dispatch<React.SetStateAction<ActivityGroup[]>>;
  setAdjustmentRootCauses: React.Dispatch<React.SetStateAction<AdjustmentRootCause[]>>;
  setUnitsOfMeasure: React.Dispatch<React.SetStateAction<UnitOfMeasure[]>>;
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setMachines: React.Dispatch<React.SetStateAction<Machine[]>>;
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  setCounterparties: React.Dispatch<React.SetStateAction<Counterparty[]>>;
  setChartOfAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  setCostCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>;
  setIncomeStatementRelationships: React.Dispatch<React.SetStateAction<IncomeStatementRelationship[]>>;
  setCuts: React.Dispatch<React.SetStateAction<Cut[]>>;
  setFieldOperations: React.Dispatch<React.SetStateAction<FieldOperation[]>>;
  setFieldOperationMachines: React.Dispatch<React.SetStateAction<FieldOperationMachine[]>>;
  setFinancialTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  setFinancialTransactionAttachments: React.Dispatch<React.SetStateAction<FinancialTransactionAttachment[]>>;
  setFinancialTransactionItems: React.Dispatch<React.SetStateAction<FinancialTransactionItem[]>>;
  setFulfillments: React.Dispatch<React.SetStateAction<FinancialTransactionFulfillment[]>>;
  setBankTransfers: React.Dispatch<React.SetStateAction<BankTransfer[]>>;
  setInventoryBatches: React.Dispatch<React.SetStateAction<InventoryBatch[]>>;
  setInventoryMovements: React.Dispatch<React.SetStateAction<InventoryMovement[]>>;
  setInventoryAdjustments: React.Dispatch<React.SetStateAction<InventoryAdjustment[]>>;
  setProductionBatches: React.Dispatch<React.SetStateAction<ProductionBatch[]>>;
  setFieldOperationItems: React.Dispatch<React.SetStateAction<FieldOperationItem[]>>;
  nextId: (items: { id: number }[]) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [incomeStatementGroups, setIncomeStatementGroups] = useState(initialIncomeStatementGroups);
  const [baseUnits, setBaseUnits] = useState(initialBaseUnits);
  const [productFamilies, setProductFamilies] = useState(initialProductFamilies);
  const [documentTypes, setDocumentTypes] = useState(initialDocumentTypes);
  const [counterpartyTypes, setCounterpartyTypes] = useState(initialCounterpartyTypes);
  const [segments, setSegments] = useState(initialSegments);
  const [activityGroups, setActivityGroups] = useState(initialActivityGroups);
  const [adjustmentRootCauses, setAdjustmentRootCauses] = useState(initialAdjustmentRootCauses);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState(initialUnitsOfMeasure);
  const [fields, setFields] = useState(initialFields);
  const [products, setProducts] = useState(initialProducts);
  const [machines, setMachines] = useState(initialMachines);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [counterparties, setCounterparties] = useState(initialCounterparties);
  const [chartOfAccounts, setChartOfAccounts] = useState(initialChartOfAccounts);
  const [costCenters, setCostCenters] = useState(initialCostCenters);
  const [incomeStatementRelationships, setIncomeStatementRelationships] = useState(initialIncomeStatementRelationships);
  const [cuts, setCuts] = useState(initialCuts);
  const [fieldOperations, setFieldOperations] = useState(initialFieldOperations);
  const [fieldOperationMachines, setFieldOperationMachines] = useState(initialFieldOperationMachines);
  const [financialTransactions, setFinancialTransactions] = useState(initialFinancialTransactions);
  const [financialTransactionAttachments, setFinancialTransactionAttachments] = useState(initialFinancialTransactionAttachments);
  const [financialTransactionItems, setFinancialTransactionItems] = useState(initialFinancialTransactionItems);
  const [fulfillments, setFulfillments] = useState(initialFinancialTransactionFulfillments);
  const [bankTransfers, setBankTransfers] = useState(initialBankTransfers);
  const [inventoryBatches, setInventoryBatches] = useState(initialInventoryBatches);
  const [inventoryMovements, setInventoryMovements] = useState(initialInventoryMovements);
  const [inventoryAdjustments, setInventoryAdjustments] = useState(initialInventoryAdjustments);
  const [productionBatches, setProductionBatches] = useState(initialProductionBatches);
  const [fieldOperationItems, setFieldOperationItems] = useState(initialFieldOperationItems);

  const nextId = (items: { id: number }[]) =>
    items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        incomeStatementGroups,
        setIncomeStatementGroups,
        baseUnits,
        setBaseUnits,
        productFamilies,
        setProductFamilies,
        documentTypes,
        setDocumentTypes,
        counterpartyTypes,
        setCounterpartyTypes,
        segments,
        setSegments,
        activityGroups,
        setActivityGroups,
        adjustmentRootCauses,
        setAdjustmentRootCauses,
        unitsOfMeasure,
        setUnitsOfMeasure,
        fields,
        setFields,
        products,
        setProducts,
        machines,
        setMachines,
        bankAccounts,
        setBankAccounts,
        counterparties,
        setCounterparties,
        chartOfAccounts,
        setChartOfAccounts,
        costCenters,
        setCostCenters,
        incomeStatementRelationships,
        setIncomeStatementRelationships,
        cuts,
        setCuts,
        fieldOperations,
        setFieldOperations,
        fieldOperationMachines,
        setFieldOperationMachines,
        financialTransactions,
        setFinancialTransactions,
        financialTransactionAttachments,
        setFinancialTransactionAttachments,
        financialTransactionItems,
        setFinancialTransactionItems,
        fulfillments,
        setFulfillments,
        bankTransfers,
        setBankTransfers,
        inventoryBatches,
        setInventoryBatches,
        inventoryMovements,
        setInventoryMovements,
        inventoryAdjustments,
        setInventoryAdjustments,
        productionBatches,
        setProductionBatches,
        fieldOperationItems,
        setFieldOperationItems,
        nextId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
