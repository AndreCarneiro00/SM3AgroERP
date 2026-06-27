import React, { createContext, useContext, useState } from 'react';
import type {
  IncomeStatementGroup, BaseUnit, ProductFamily, DocumentType,
  CounterpartyType, Segment, ActivityGroup, BankAccount, Field,
  UnitOfMeasure, ChartOfAccount, Cut, CostCenter, Product,
  Counterparty, BankTransfer, Batch, FinancialTransaction,
  FinancialTransactionItem, InventoryMovement, FinancialTransactionFulfillment,
  PageId,
} from '../data/types';
import {
  incomeStatementGroups as initialISG,
  baseUnits as initialBU,
  productFamilies as initialPF,
  documentTypes as initialDT,
  counterpartyTypes as initialCPT,
  segments as initialSeg,
  activityGroups as initialAG,
  bankAccounts as initialBA,
  fields as initialFields,
  unitsOfMeasure as initialUOM,
  chartOfAccounts as initialCOA,
  cuts as initialCuts,
  costCenters as initialCC,
  products as initialProducts,
  counterparties as initialCP,
  bankTransfers as initialBT,
  batches as initialBatches,
  financialTransactions as initialFT,
  financialTransactionItems as initialFTI,
  inventoryMovements as initialIM,
  financialTransactionFulfillments as initialFTF,
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
  bankAccounts: BankAccount[];
  fields: Field[];
  unitsOfMeasure: UnitOfMeasure[];
  chartOfAccounts: ChartOfAccount[];
  cuts: Cut[];
  costCenters: CostCenter[];
  products: Product[];
  counterparties: Counterparty[];
  bankTransfers: BankTransfer[];
  batches: Batch[];
  financialTransactions: FinancialTransaction[];
  financialTransactionItems: FinancialTransactionItem[];
  inventoryMovements: InventoryMovement[];
  fulfillments: FinancialTransactionFulfillment[];
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
  setBankAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  setUnitsOfMeasure: React.Dispatch<React.SetStateAction<UnitOfMeasure[]>>;
  setChartOfAccounts: React.Dispatch<React.SetStateAction<ChartOfAccount[]>>;
  setCuts: React.Dispatch<React.SetStateAction<Cut[]>>;
  setCostCenters: React.Dispatch<React.SetStateAction<CostCenter[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setCounterparties: React.Dispatch<React.SetStateAction<Counterparty[]>>;
  setBankTransfers: React.Dispatch<React.SetStateAction<BankTransfer[]>>;
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  setFinancialTransactions: React.Dispatch<React.SetStateAction<FinancialTransaction[]>>;
  setFinancialTransactionItems: React.Dispatch<React.SetStateAction<FinancialTransactionItem[]>>;
  setInventoryMovements: React.Dispatch<React.SetStateAction<InventoryMovement[]>>;
  setFulfillments: React.Dispatch<React.SetStateAction<FinancialTransactionFulfillment[]>>;
  nextId: (items: { id: number }[]) => number;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [incomeStatementGroups, setIncomeStatementGroups] = useState(initialISG);
  const [baseUnits, setBaseUnits] = useState(initialBU);
  const [productFamilies, setProductFamilies] = useState(initialPF);
  const [documentTypes, setDocumentTypes] = useState(initialDT);
  const [counterpartyTypes, setCounterpartyTypes] = useState(initialCPT);
  const [segments, setSegments] = useState(initialSeg);
  const [activityGroups, setActivityGroups] = useState(initialAG);
  const [bankAccounts, setBankAccounts] = useState(initialBA);
  const [fields, setFields] = useState(initialFields);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState(initialUOM);
  const [chartOfAccounts, setChartOfAccounts] = useState(initialCOA);
  const [cuts, setCuts] = useState(initialCuts);
  const [costCenters, setCostCenters] = useState(initialCC);
  const [products, setProducts] = useState(initialProducts);
  const [counterparties, setCounterparties] = useState(initialCP);
  const [bankTransfers, setBankTransfers] = useState(initialBT);
  const [batches, setBatches] = useState(initialBatches);
  const [financialTransactions, setFinancialTransactions] = useState(initialFT);
  const [financialTransactionItems, setFinancialTransactionItems] = useState(initialFTI);
  const [inventoryMovements, setInventoryMovements] = useState(initialIM);
  const [fulfillments, setFulfillments] = useState(initialFTF);

  const nextId = (items: { id: number }[]) =>
    items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;

  return (
    <AppContext.Provider value={{
      currentPage, setCurrentPage,
      incomeStatementGroups, setIncomeStatementGroups,
      baseUnits, setBaseUnits,
      productFamilies, setProductFamilies,
      documentTypes, setDocumentTypes,
      counterpartyTypes, setCounterpartyTypes,
      segments, setSegments,
      activityGroups, setActivityGroups,
      bankAccounts, setBankAccounts,
      fields, setFields,
      unitsOfMeasure, setUnitsOfMeasure,
      chartOfAccounts, setChartOfAccounts,
      cuts, setCuts,
      costCenters, setCostCenters,
      products, setProducts,
      counterparties, setCounterparties,
      bankTransfers, setBankTransfers,
      batches, setBatches,
      financialTransactions, setFinancialTransactions,
      financialTransactionItems, setFinancialTransactionItems,
      inventoryMovements, setInventoryMovements,
      fulfillments, setFulfillments,
      nextId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
