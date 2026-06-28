import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, IconButton, Tooltip, Avatar,
  AppBar, Toolbar, Stack,
} from '@mui/material';
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
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BarChartIcon from '@mui/icons-material/BarChart';
import type { PageId } from '../data/types';

const DRAWER_WIDTH = 240;

interface NavItem {
  id?: PageId;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  {
    label: 'Financeiro',
    icon: <ReceiptLongIcon fontSize="small" />,
    children: [
      { id: 'financial-transactions', label: 'Transações', icon: <ReceiptLongIcon fontSize="small" /> },
      { id: 'financial-items', label: 'Itens Financeiros', icon: <PaymentsIcon fontSize="small" /> },
      { id: 'financial-attachments', label: 'Anexos', icon: <PaymentsIcon fontSize="small" /> },
      { id: 'financial-fulfillments', label: 'Pagamentos', icon: <PaymentsIcon fontSize="small" /> },
      { id: 'financial-bank-transfers', label: 'Transferências', icon: <SwapHorizIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Contabilidade',
    icon: <AccountTreeIcon fontSize="small" />,
    children: [
      { id: 'accounting-chart', label: 'Plano de Contas', icon: <AccountTreeIcon fontSize="small" /> },
      { id: 'accounting-cost-centers', label: 'Centros de Custo', icon: <SpaceDashboardIcon fontSize="small" /> },
      { id: 'accounting-dre', label: 'Grupos DRE', icon: <BarChartIcon fontSize="small" /> },
      { id: 'accounting-dre-relationships', label: 'Relacionamentos DRE', icon: <BarChartIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Agrícola',
    icon: <AgricultureIcon fontSize="small" />,
    children: [
      { id: 'agricultural-fields', label: 'Campos', icon: <GrassIcon fontSize="small" /> },
      { id: 'agricultural-machines', label: 'Máquinas', icon: <AgricultureIcon fontSize="small" /> },
      { id: 'agricultural-cuts', label: 'Cortes', icon: <SpaIcon fontSize="small" /> },
      { id: 'agricultural-operations', label: 'Operações', icon: <SpaIcon fontSize="small" /> },
      { id: 'agricultural-operation-machines', label: 'Operação x Máquina', icon: <SpaIcon fontSize="small" /> },
      { id: 'agricultural-operation-items', label: 'Itens da Operação', icon: <InventoryIcon fontSize="small" /> },
      { id: 'agricultural-production-batches', label: 'Lotes de Produção', icon: <InventoryIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Produtos & Estoque',
    icon: <InventoryIcon fontSize="small" />,
    children: [
      { id: 'products-list', label: 'Produtos', icon: <CategoryIcon fontSize="small" /> },
      { id: 'products-families', label: 'Famílias', icon: <CategoryIcon fontSize="small" /> },
      { id: 'products-units', label: 'Unidades', icon: <ScaleIcon fontSize="small" /> },
      { id: 'inventory-batches', label: 'Lotes de Estoque', icon: <InventoryIcon fontSize="small" /> },
      { id: 'inventory-movements', label: 'Movimentações', icon: <MoveToInboxIcon fontSize="small" /> },
      { id: 'inventory-adjustments', label: 'Ajustes', icon: <MoveToInboxIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Bancos',
    icon: <AccountBalanceIcon fontSize="small" />,
    children: [
      { id: 'banking-accounts', label: 'Contas Bancárias', icon: <AccountBalanceWalletIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Cadastros',
    icon: <PeopleIcon fontSize="small" />,
    children: [
      { id: 'master-counterparties', label: 'Contrapartes', icon: <PeopleIcon fontSize="small" /> },
      { id: 'master-counterparty-types', label: 'Tipos de Contraparte', icon: <CategoryIcon fontSize="small" /> },
      { id: 'master-segments', label: 'Segmentos', icon: <CategoryIcon fontSize="small" /> },
      { id: 'master-activity-groups', label: 'Grupos de Atividade', icon: <CategoryIcon fontSize="small" /> },
      { id: 'master-document-types', label: 'Tipos de Documento', icon: <CategoryIcon fontSize="small" /> },
      { id: 'master-adjustment-root-causes', label: 'Causas de Ajuste', icon: <CategoryIcon fontSize="small" /> },
    ],
  },
];

interface LayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

function NavSection({ item, currentPage, onNavigate, collapsed }: {
  item: NavItem;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive = item.children?.some(c => c.id === currentPage);
  const [open, setOpen] = useState(isChildActive ?? false);

  if (!hasChildren && item.id) {
    return (
      <Tooltip title={collapsed ? item.label : ''} placement="right">
        <ListItemButton
          selected={currentPage === item.id}
          onClick={() => onNavigate(item.id!)}
          sx={{ pl: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit', opacity: 0.8 }}>
            {item.icon}
          </ListItemIcon>
          {!collapsed && <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.82rem' }} />}
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={collapsed ? item.label : ''} placement="right">
        <ListItemButton onClick={() => !collapsed && setOpen(o => !o)} sx={{ pl: 1.5 }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit', opacity: isChildActive ? 1 : 0.7 }}>
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.82rem',
                  fontWeight: isChildActive ? 600 : 400,
                  color: isChildActive ? '#A5D6A7' : 'inherit',
                }}
              />
              {open ? <ExpandLessIcon sx={{ fontSize: 16, opacity: 0.6 }} /> : <ExpandMoreIcon sx={{ fontSize: 16, opacity: 0.6 }} />}
            </>
          )}
        </ListItemButton>
      </Tooltip>
      {!collapsed && (
        <Collapse in={open} timeout="auto">
          <List disablePadding>
            {item.children?.map(child => (
              <ListItemButton
                key={child.id}
                selected={currentPage === child.id}
                onClick={() => child.id && onNavigate(child.id)}
                sx={{ pl: 4 }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: 'inherit', opacity: 0.7 }}>
                  {child.icon}
                </ListItemIcon>
                <ListItemText
                  primary={child.label}
                  primaryTypographyProps={{ fontSize: '0.78rem' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const drawerWidth = collapsed ? 56 : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          transition: 'width 0.2s',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            overflowX: 'hidden',
            transition: 'width 0.2s',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{
          px: collapsed ? 1 : 2, py: 1.5,
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          minHeight: 56,
        }}>
          {!collapsed && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ bgcolor: '#4CAF50', width: 32, height: 32, fontSize: '0.9rem' }}>S</Avatar>
              <Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#E8F5E9', lineHeight: 1.2 }}>
                  SM3 Agro ERP
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#81C784', lineHeight: 1 }}>
                  Protótipo operacional
                </Typography>
              </Box>
            </Stack>
          )}
          {collapsed && (
            <Avatar sx={{ bgcolor: '#4CAF50', width: 30, height: 30, fontSize: '0.85rem' }}>S</Avatar>
          )}
          {!collapsed && (
            <IconButton onClick={() => setCollapsed(true)} sx={{ color: '#81C784', p: 0.5 }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <IconButton onClick={() => setCollapsed(false)} sx={{ color: '#81C784', p: 0.5 }}>
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Nav */}
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 0.5 }}>
          <List dense disablePadding>
            {navItems.map((item, i) => (
              <NavSection
                key={i}
                item={item}
                currentPage={currentPage}
                onNavigate={onNavigate}
                collapsed={collapsed}
              />
            ))}
          </List>
        </Box>

        <Divider />
        <Box sx={{ p: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <Tooltip title="Configurações" placement="right">
            <IconButton sx={{ color: '#81C784' }} size="small">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.08)', color: 'text.primary' }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 48 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {getPageTitle(currentPage)}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
              Dados locais • Safra 2025
            </Typography>
            <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, fontSize: '0.8rem' }}>US</Avatar>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

function getPageTitle(page: PageId): string {
  const titles: Record<PageId, string> = {
    'dashboard': 'Dashboard',
    'financial-transactions': 'Transações Financeiras',
    'financial-items': 'Itens Financeiros',
    'financial-attachments': 'Anexos de Transações',
    'financial-fulfillments': 'Pagamentos e Recebimentos',
    'financial-bank-transfers': 'Transferências Bancárias',
    'accounting-chart': 'Plano de Contas',
    'accounting-cost-centers': 'Centros de Custo',
    'accounting-dre': 'Grupos DRE',
    'accounting-dre-relationships': 'Relacionamentos DRE',
    'agricultural-fields': 'Campos Agrícolas',
    'agricultural-machines': 'Máquinas Agrícolas',
    'agricultural-cuts': 'Cortes',
    'agricultural-operations': 'Operações de Campo',
    'agricultural-operation-machines': 'Máquinas por Operação',
    'agricultural-operation-items': 'Itens das Operações',
    'agricultural-production-batches': 'Lotes de Produção',
    'products-list': 'Produtos',
    'products-families': 'Famílias de Produtos',
    'products-units': 'Unidades de Medida',
    'inventory-batches': 'Lotes de Estoque',
    'inventory-movements': 'Movimentações de Estoque',
    'inventory-adjustments': 'Ajustes de Estoque',
    'banking-accounts': 'Contas Bancárias',
    'master-counterparties': 'Contrapartes',
    'master-counterparty-types': 'Tipos de Contraparte',
    'master-segments': 'Segmentos',
    'master-activity-groups': 'Grupos de Atividade',
    'master-document-types': 'Tipos de Documento',
    'master-adjustment-root-causes': 'Causas Raiz de Ajuste',
  };
  return titles[page] || page;
}
