import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { FinancialModule } from './components/financial/FinancialModule';
import { AccountingModule } from './components/accounting/AccountingModule';
import { AgriculturalModule } from './components/agricultural/AgriculturalModule';
import { ProductsModule } from './components/products/ProductsModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { BankingModule } from './components/banking/BankingModule';
import { MasterDataModule } from './components/master/MasterDataModule';

function AppContent() {
  const { currentPage, setCurrentPage } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'financial-transactions': return <FinancialModule tab="transactions" />;
      case 'financial-items': return <FinancialModule tab="items" />;
      case 'financial-attachments': return <FinancialModule tab="attachments" />;
      case 'financial-fulfillments': return <FinancialModule tab="fulfillments" />;
      case 'financial-bank-transfers': return <FinancialModule tab="bank-transfers" />;
      case 'accounting-chart': return <AccountingModule tab="chart" />;
      case 'accounting-cost-centers': return <AccountingModule tab="cost-centers" />;
      case 'accounting-dre': return <AccountingModule tab="dre" />;
      case 'accounting-dre-relationships': return <AccountingModule tab="dre-relationships" />;
      case 'agricultural-fields': return <AgriculturalModule tab="fields" />;
      case 'agricultural-machines': return <AgriculturalModule tab="machines" />;
      case 'agricultural-cuts': return <AgriculturalModule tab="cuts" />;
      case 'agricultural-operations': return <AgriculturalModule tab="operations" />;
      case 'agricultural-operation-machines': return <AgriculturalModule tab="operation-machines" />;
      case 'agricultural-operation-items': return <AgriculturalModule tab="operation-items" />;
      case 'agricultural-production-batches': return <AgriculturalModule tab="production-batches" />;
      case 'products-list': return <ProductsModule tab="list" />;
      case 'products-families': return <ProductsModule tab="families" />;
      case 'products-units': return <ProductsModule tab="units" />;
      case 'inventory-batches': return <InventoryModule tab="batches" />;
      case 'inventory-movements': return <InventoryModule tab="movements" />;
      case 'inventory-adjustments': return <InventoryModule tab="adjustments" />;
      case 'banking-accounts': return <BankingModule />;
      case 'master-counterparties': return <MasterDataModule tab="counterparties" />;
      case 'master-counterparty-types': return <MasterDataModule tab="counterparty-types" />;
      case 'master-segments': return <MasterDataModule tab="segments" />;
      case 'master-activity-groups': return <MasterDataModule tab="activity-groups" />;
      case 'master-document-types': return <MasterDataModule tab="document-types" />;
      case 'master-adjustment-root-causes': return <MasterDataModule tab="adjustment-root-causes" />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}
