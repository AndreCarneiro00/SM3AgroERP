import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#F9A825',
      light: '#FDD835',
      dark: '#F57F17',
      contrastText: '#000000',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    error: { main: '#D32F2F' },
    warning: { main: '#F57C00' },
    info: { main: '#1565C0' },
    success: { main: '#2E7D32' },
    text: {
      primary: '#1A2027',
      secondary: '#5A6673',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 13,
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, fontSize: '0.8rem' },
    body2: { fontSize: '0.82rem' },
    caption: { fontSize: '0.75rem' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A2B1C',
          color: '#E8F5E9',
          borderRight: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F5F5F5',
          fontWeight: 600,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#5A6673',
          padding: '8px 12px',
        },
        body: {
          padding: '8px 12px',
          fontSize: '0.82rem',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#F9FBF9' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.82rem',
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.76rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: '0.72rem' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 12 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '1px 8px',
          padding: '6px 12px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(76, 175, 80, 0.25)',
            color: '#A5D6A7',
            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.3)' },
          },
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(255,255,255,0.1)' },
      },
    },
  },
});

export default theme;
