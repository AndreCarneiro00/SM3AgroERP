import type { ReactNode } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import GrassIcon from '@mui/icons-material/Grass';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SpaIcon from '@mui/icons-material/Spa';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ScaleIcon from '@mui/icons-material/Scale';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

export const appPaths = {
  dashboard: '/dashboard',
  financialTransactions: '/financeiro/transacoes',
  financialItems: '/financeiro/itens',
  financialAttachments: '/financeiro/anexos',
  financialFulfillments: '/financeiro/pagamentos',
  financialBankTransfers: '/financeiro/transferencias',
  accountingChart: '/contabilidade/plano-de-contas',
  accountingCostCenters: '/contabilidade/centros-de-custo',
  accountingDre: '/contabilidade/grupos-dre',
  accountingDreRelationships: '/contabilidade/relacionamentos-dre',
  agriculturalFields: '/agricola/campos',
  agriculturalMachines: '/agricola/maquinas',
  agriculturalCuts: '/agricola/cortes',
  agriculturalOperations: '/agricola/operacoes',
  agriculturalOperationMachines: '/agricola/operacao-maquinas',
  agriculturalOperationItems: '/agricola/operacao-itens',
  agriculturalProductionBatches: '/agricola/lotes-producao',
  productsList: '/produtos/lista',
  productsFamilies: '/produtos/familias',
  productsUnits: '/produtos/unidades',
  inventoryBatches: '/estoque/lotes',
  inventoryMovements: '/estoque/movimentacoes',
  inventoryAdjustments: '/estoque/ajustes',
  bankingAccounts: '/bancos/contas',
  masterCounterparties: '/cadastros/contrapartes',
  masterCounterpartyTypes: '/cadastros/tipos-contraparte',
  masterSegments: '/cadastros/segmentos',
  masterActivityGroups: '/cadastros/grupos-atividade',
  masterDocumentTypes: '/cadastros/tipos-documento',
  masterAdjustmentRootCauses: '/cadastros/causas-ajuste',
} as const;

export type AppRouteKey = keyof typeof appPaths;

export interface AppRouteMeta {
  key: AppRouteKey;
  path: (typeof appPaths)[AppRouteKey];
  title: string;
  navLabel: string;
  icon: ReactNode;
}

export const routeMetaByKey: Record<AppRouteKey, AppRouteMeta> = {
  dashboard: {
    key: 'dashboard',
    path: appPaths.dashboard,
    title: 'Dashboard',
    navLabel: 'Dashboard',
    icon: <DashboardIcon fontSize="small" />,
  },
  financialTransactions: {
    key: 'financialTransactions',
    path: appPaths.financialTransactions,
    title: 'Transacoes Financeiras',
    navLabel: 'Transacoes',
    icon: <ReceiptLongIcon fontSize="small" />,
  },
  financialItems: {
    key: 'financialItems',
    path: appPaths.financialItems,
    title: 'Itens Financeiros',
    navLabel: 'Itens Financeiros',
    icon: <PaymentsIcon fontSize="small" />,
  },
  financialAttachments: {
    key: 'financialAttachments',
    path: appPaths.financialAttachments,
    title: 'Anexos de Transacoes',
    navLabel: 'Anexos',
    icon: <PaymentsIcon fontSize="small" />,
  },
  financialFulfillments: {
    key: 'financialFulfillments',
    path: appPaths.financialFulfillments,
    title: 'Pagamentos e Recebimentos',
    navLabel: 'Pagamentos',
    icon: <PaymentsIcon fontSize="small" />,
  },
  financialBankTransfers: {
    key: 'financialBankTransfers',
    path: appPaths.financialBankTransfers,
    title: 'Transferencias Bancarias',
    navLabel: 'Transferencias',
    icon: <SwapHorizIcon fontSize="small" />,
  },
  accountingChart: {
    key: 'accountingChart',
    path: appPaths.accountingChart,
    title: 'Plano de Contas',
    navLabel: 'Plano de Contas',
    icon: <AccountTreeIcon fontSize="small" />,
  },
  accountingCostCenters: {
    key: 'accountingCostCenters',
    path: appPaths.accountingCostCenters,
    title: 'Centros de Custo',
    navLabel: 'Centros de Custo',
    icon: <SpaceDashboardIcon fontSize="small" />,
  },
  accountingDre: {
    key: 'accountingDre',
    path: appPaths.accountingDre,
    title: 'Grupos DRE',
    navLabel: 'Grupos DRE',
    icon: <BarChartIcon fontSize="small" />,
  },
  accountingDreRelationships: {
    key: 'accountingDreRelationships',
    path: appPaths.accountingDreRelationships,
    title: 'Relacionamentos DRE',
    navLabel: 'Relacionamentos DRE',
    icon: <BarChartIcon fontSize="small" />,
  },
  agriculturalFields: {
    key: 'agriculturalFields',
    path: appPaths.agriculturalFields,
    title: 'Campos Agricolas',
    navLabel: 'Campos',
    icon: <GrassIcon fontSize="small" />,
  },
  agriculturalMachines: {
    key: 'agriculturalMachines',
    path: appPaths.agriculturalMachines,
    title: 'Maquinas Agricolas',
    navLabel: 'Maquinas',
    icon: <AgricultureIcon fontSize="small" />,
  },
  agriculturalCuts: {
    key: 'agriculturalCuts',
    path: appPaths.agriculturalCuts,
    title: 'Cortes',
    navLabel: 'Cortes',
    icon: <SpaIcon fontSize="small" />,
  },
  agriculturalOperations: {
    key: 'agriculturalOperations',
    path: appPaths.agriculturalOperations,
    title: 'Operacoes de Campo',
    navLabel: 'Operacoes',
    icon: <SpaIcon fontSize="small" />,
  },
  agriculturalOperationMachines: {
    key: 'agriculturalOperationMachines',
    path: appPaths.agriculturalOperationMachines,
    title: 'Operacao x Maquina',
    navLabel: 'Operacao x Maquina',
    icon: <SpaIcon fontSize="small" />,
  },
  agriculturalOperationItems: {
    key: 'agriculturalOperationItems',
    path: appPaths.agriculturalOperationItems,
    title: 'Itens das Operacoes',
    navLabel: 'Itens da Operacao',
    icon: <InventoryIcon fontSize="small" />,
  },
  agriculturalProductionBatches: {
    key: 'agriculturalProductionBatches',
    path: appPaths.agriculturalProductionBatches,
    title: 'Lotes de Producao',
    navLabel: 'Lotes de Producao',
    icon: <InventoryIcon fontSize="small" />,
  },
  productsList: {
    key: 'productsList',
    path: appPaths.productsList,
    title: 'Produtos',
    navLabel: 'Produtos',
    icon: <CategoryIcon fontSize="small" />,
  },
  productsFamilies: {
    key: 'productsFamilies',
    path: appPaths.productsFamilies,
    title: 'Familias de Produtos',
    navLabel: 'Familias',
    icon: <CategoryIcon fontSize="small" />,
  },
  productsUnits: {
    key: 'productsUnits',
    path: appPaths.productsUnits,
    title: 'Unidades de Medida',
    navLabel: 'Unidades',
    icon: <ScaleIcon fontSize="small" />,
  },
  inventoryBatches: {
    key: 'inventoryBatches',
    path: appPaths.inventoryBatches,
    title: 'Lotes de Estoque',
    navLabel: 'Lotes de Estoque',
    icon: <InventoryIcon fontSize="small" />,
  },
  inventoryMovements: {
    key: 'inventoryMovements',
    path: appPaths.inventoryMovements,
    title: 'Movimentacoes de Estoque',
    navLabel: 'Movimentacoes',
    icon: <MoveToInboxIcon fontSize="small" />,
  },
  inventoryAdjustments: {
    key: 'inventoryAdjustments',
    path: appPaths.inventoryAdjustments,
    title: 'Ajustes de Estoque',
    navLabel: 'Ajustes',
    icon: <MoveToInboxIcon fontSize="small" />,
  },
  bankingAccounts: {
    key: 'bankingAccounts',
    path: appPaths.bankingAccounts,
    title: 'Contas Bancarias',
    navLabel: 'Contas Bancarias',
    icon: <AccountBalanceWalletIcon fontSize="small" />,
  },
  masterCounterparties: {
    key: 'masterCounterparties',
    path: appPaths.masterCounterparties,
    title: 'Contrapartes',
    navLabel: 'Contrapartes',
    icon: <PeopleIcon fontSize="small" />,
  },
  masterCounterpartyTypes: {
    key: 'masterCounterpartyTypes',
    path: appPaths.masterCounterpartyTypes,
    title: 'Tipos de Contraparte',
    navLabel: 'Tipos de Contraparte',
    icon: <CategoryIcon fontSize="small" />,
  },
  masterSegments: {
    key: 'masterSegments',
    path: appPaths.masterSegments,
    title: 'Segmentos',
    navLabel: 'Segmentos',
    icon: <CategoryIcon fontSize="small" />,
  },
  masterActivityGroups: {
    key: 'masterActivityGroups',
    path: appPaths.masterActivityGroups,
    title: 'Grupos de Atividade',
    navLabel: 'Grupos de Atividade',
    icon: <CategoryIcon fontSize="small" />,
  },
  masterDocumentTypes: {
    key: 'masterDocumentTypes',
    path: appPaths.masterDocumentTypes,
    title: 'Tipos de Documento',
    navLabel: 'Tipos de Documento',
    icon: <CategoryIcon fontSize="small" />,
  },
  masterAdjustmentRootCauses: {
    key: 'masterAdjustmentRootCauses',
    path: appPaths.masterAdjustmentRootCauses,
    title: 'Causas Raiz de Ajuste',
    navLabel: 'Causas de Ajuste',
    icon: <CategoryIcon fontSize="small" />,
  },
};

export const appRouteMeta = Object.values(routeMetaByKey) as AppRouteMeta[];

type NavSectionDefinition =
  | {
      key: string;
      label: string;
      icon: ReactNode;
      routeKey: AppRouteKey;
      children?: never;
    }
  | {
      key: string;
      label: string;
      icon: ReactNode;
      children: AppRouteKey[];
      routeKey?: never;
    };

function childRoutes(...routes: AppRouteKey[]) {
  return routes;
}

export const navSections = [
  {
    key: 'dashboard',
    label: routeMetaByKey.dashboard.navLabel,
    icon: routeMetaByKey.dashboard.icon,
    routeKey: 'dashboard',
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    icon: <ReceiptLongIcon fontSize="small" />,
    children: childRoutes(
      'financialTransactions',
      'financialItems',
      'financialAttachments',
      'financialFulfillments',
      'financialBankTransfers',
    ),
  },
  {
    key: 'contabilidade',
    label: 'Contabilidade',
    icon: <AccountTreeIcon fontSize="small" />,
    children: childRoutes(
      'accountingChart',
      'accountingCostCenters',
      'accountingDre',
      'accountingDreRelationships',
    ),
  },
  {
    key: 'agricola',
    label: 'Agricola',
    icon: <AgricultureIcon fontSize="small" />,
    children: childRoutes(
      'agriculturalFields',
      'agriculturalMachines',
      'agriculturalCuts',
      'agriculturalOperations',
      'agriculturalOperationMachines',
      'agriculturalOperationItems',
      'agriculturalProductionBatches',
    ),
  },
  {
    key: 'produtos-estoque',
    label: 'Produtos & Estoque',
    icon: <InventoryIcon fontSize="small" />,
    children: childRoutes(
      'productsList',
      'productsFamilies',
      'productsUnits',
      'inventoryBatches',
      'inventoryMovements',
      'inventoryAdjustments',
    ),
  },
  {
    key: 'bancos',
    label: 'Bancos',
    icon: <AccountBalanceIcon fontSize="small" />,
    children: childRoutes('bankingAccounts'),
  },
  {
    key: 'cadastros',
    label: 'Cadastros',
    icon: <PeopleIcon fontSize="small" />,
    children: childRoutes(
      'masterCounterparties',
      'masterCounterpartyTypes',
      'masterSegments',
      'masterActivityGroups',
      'masterDocumentTypes',
      'masterAdjustmentRootCauses',
    ),
  },
] satisfies NavSectionDefinition[];

export function getRouteMetaByPathname(pathname: string) {
  return appRouteMeta.find((route) => route.path === pathname);
}
