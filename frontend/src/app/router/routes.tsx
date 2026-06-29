import { lazy, Suspense, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import { appPaths, routeMetaByKey, type AppRouteKey } from './routeMeta';

const Dashboard = lazy(async () => {
  const module = await import('../components/Dashboard');
  return { default: module.Dashboard };
});

const FinancialModule = lazy(async () => {
  const module = await import('../components/financial/FinancialModule');
  return { default: module.FinancialModule };
});

const AccountingModule = lazy(async () => {
  const module = await import('../components/accounting/AccountingModule');
  return { default: module.AccountingModule };
});

const AgriculturalModule = lazy(async () => {
  const module = await import('../components/agricultural/AgriculturalModule');
  return { default: module.AgriculturalModule };
});

const ProductsModule = lazy(async () => {
  const module = await import('../components/products/ProductsModule');
  return { default: module.ProductsModule };
});

const InventoryModule = lazy(async () => {
  const module = await import('../components/inventory/InventoryModule');
  return { default: module.InventoryModule };
});

const BankingModule = lazy(async () => {
  const module = await import('../components/banking/BankingModule');
  return { default: module.BankingModule };
});

const MasterDataModule = lazy(async () => {
  const module = await import('../components/master/MasterDataModule');
  return { default: module.MasterDataModule };
});

function RouteFallback() {
  return (
    <Box
      sx={{
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

const routeElements: Record<AppRouteKey, ReactNode> = {
  dashboard: <Dashboard />,
  financialTransactions: <FinancialModule tab="transactions" />,
  financialItems: <FinancialModule tab="items" />,
  financialAttachments: <FinancialModule tab="attachments" />,
  financialFulfillments: <FinancialModule tab="fulfillments" />,
  financialBankTransfers: <FinancialModule tab="bank-transfers" />,
  accountingChart: <AccountingModule tab="chart" />,
  accountingCostCenters: <AccountingModule tab="cost-centers" />,
  accountingDre: <AccountingModule tab="dre" />,
  accountingDreRelationships: <AccountingModule tab="dre-relationships" />,
  agriculturalFields: <AgriculturalModule tab="fields" />,
  agriculturalMachines: <AgriculturalModule tab="machines" />,
  agriculturalCuts: <AgriculturalModule tab="cuts" />,
  agriculturalOperations: <AgriculturalModule tab="operations" />,
  agriculturalOperationMachines: <AgriculturalModule tab="operation-machines" />,
  agriculturalOperationItems: <AgriculturalModule tab="operation-items" />,
  agriculturalProductionBatches: <AgriculturalModule tab="production-batches" />,
  productsList: <ProductsModule tab="list" />,
  productsFamilies: <ProductsModule tab="families" />,
  productsUnits: <ProductsModule tab="units" />,
  inventoryBatches: <InventoryModule tab="batches" />,
  inventoryMovements: <InventoryModule tab="movements" />,
  inventoryAdjustments: <InventoryModule tab="adjustments" />,
  bankingAccounts: <BankingModule />,
  masterCounterparties: <MasterDataModule tab="counterparties" />,
  masterCounterpartyTypes: <MasterDataModule tab="counterparty-types" />,
  masterSegments: <MasterDataModule tab="segments" />,
  masterActivityGroups: <MasterDataModule tab="activity-groups" />,
  masterDocumentTypes: <MasterDataModule tab="document-types" />,
  masterAdjustmentRootCauses: (
    <MasterDataModule tab="adjustment-root-causes" />
  ),
};

export function AppRoutes() {
  const routeKeys = Object.keys(routeMetaByKey) as AppRouteKey[];

  return (
    <Routes>
      <Route path="/" element={<Navigate to={appPaths.dashboard} replace />} />
      {routeKeys.map((routeKey) => (
        <Route
          key={routeKey}
          path={routeMetaByKey[routeKey].path}
          element={<LazyRoute>{routeElements[routeKey]}</LazyRoute>}
        />
      ))}
      <Route path="*" element={<Navigate to={appPaths.dashboard} replace />} />
    </Routes>
  );
}
