import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/ui/useUiStore';
import {
  getRouteMetaByPathname,
  navSections,
  routeMetaByKey,
  type AppRouteKey,
} from '../router/routeMeta';

const DRAWER_WIDTH = 240;

function NavSection({
  item,
  currentPathname,
  collapsed,
  onNavigate,
}: {
  item: (typeof navSections)[number];
  currentPathname: string;
  collapsed: boolean;
  onNavigate: (routeKey: AppRouteKey) => void;
}) {
  const hasChildren = 'children' in item;
  const isChildActive = hasChildren
    ? item.children.some(
        (routeKey) => routeMetaByKey[routeKey].path === currentPathname,
      )
    : routeMetaByKey[item.routeKey].path === currentPathname;
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  if (!hasChildren) {
    const routeMeta = routeMetaByKey[item.routeKey];

    return (
      <Tooltip title={collapsed ? item.label : ''} placement="right">
        <ListItemButton
          selected={currentPathname === routeMeta.path}
          onClick={() => onNavigate(item.routeKey)}
          sx={{ pl: 1.5 }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: 'inherit', opacity: 0.8 }}>
            {item.icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.82rem' }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip title={collapsed ? item.label : ''} placement="right">
        <ListItemButton
          onClick={() => !collapsed && setOpen((current) => !current)}
          sx={{ pl: 1.5 }}
        >
          <ListItemIcon
            sx={{ minWidth: 32, color: 'inherit', opacity: isChildActive ? 1 : 0.7 }}
          >
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
              {open ? (
                <ExpandLessIcon sx={{ fontSize: 16, opacity: 0.6 }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: 16, opacity: 0.6 }} />
              )}
            </>
          )}
        </ListItemButton>
      </Tooltip>
      {!collapsed && (
        <Collapse in={open} timeout="auto">
          <List disablePadding>
            {item.children.map((routeKey) => {
              const routeMeta = routeMetaByKey[routeKey];

              return (
                <ListItemButton
                  key={routeKey}
                  selected={currentPathname === routeMeta.path}
                  onClick={() => onNavigate(routeKey)}
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon
                    sx={{ minWidth: 28, color: 'inherit', opacity: 0.7 }}
                  >
                    {routeMeta.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={routeMeta.navLabel}
                    primaryTypographyProps={{ fontSize: '0.78rem' }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      )}
    </>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = useUiStore((state) => state.isDrawerCollapsed);
  const setDrawerCollapsed = useUiStore((state) => state.setDrawerCollapsed);
  const currentRoute =
    getRouteMetaByPathname(location.pathname) ?? routeMetaByKey.dashboard;
  const drawerWidth = collapsed ? 56 : DRAWER_WIDTH;

  const navigateTo = (routeKey: AppRouteKey) => {
    navigate(routeMetaByKey[routeKey].path);
  };

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
        <Box
          sx={{
            px: collapsed ? 1 : 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            minHeight: 56,
          }}
        >
          {!collapsed && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                sx={{ bgcolor: '#4CAF50', width: 32, height: 32, fontSize: '0.9rem' }}
              >
                S
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#E8F5E9',
                    lineHeight: 1.2,
                  }}
                >
                  SM3 Agro ERP
                </Typography>
                <Typography
                  sx={{ fontSize: '0.65rem', color: '#81C784', lineHeight: 1 }}
                >
                  Prototipo operacional
                </Typography>
              </Box>
            </Stack>
          )}
          {collapsed && (
            <Avatar
              sx={{ bgcolor: '#4CAF50', width: 30, height: 30, fontSize: '0.85rem' }}
            >
              S
            </Avatar>
          )}
          {!collapsed && (
            <IconButton
              onClick={() => setDrawerCollapsed(true)}
              sx={{ color: '#81C784', p: 0.5 }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
            <IconButton
              onClick={() => setDrawerCollapsed(false)}
              sx={{ color: '#81C784', p: 0.5 }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 0.5 }}>
          <List dense disablePadding>
            {navSections.map((item) => (
              <NavSection
                key={item.key}
                item={item}
                currentPathname={location.pathname}
                onNavigate={navigateTo}
                collapsed={collapsed}
              />
            ))}
          </List>
        </Box>

        <Divider />
        <Box
          sx={{
            p: 1,
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Tooltip title="Configuracoes" placement="right">
            <IconButton sx={{ color: '#81C784' }} size="small">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Drawer>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            color: 'text.primary',
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 48 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: 'text.primary' }}
            >
              {currentRoute.title}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 2 }}>
              Dados locais - Safra 2025
            </Typography>
            <Avatar
              sx={{ bgcolor: 'primary.main', width: 30, height: 30, fontSize: '0.8rem' }}
            >
              US
            </Avatar>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>{children}</Box>
      </Box>
    </Box>
  );
}
