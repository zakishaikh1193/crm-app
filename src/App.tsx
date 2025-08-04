import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ContactListPage from './pages/ContactListPage';
import ContactDetailPage from './pages/ContactDetailPage';
import ContactEditPage from './pages/ContactEditPage';
import CreateContactPage from './pages/CreateContactPage';
import CompanyListPage from './pages/CompanyListPage';
import CreateCompanyPage from './pages/CreateCompanyPage';
import ImportDataPage from './pages/ImportDataPage';
import DataUtilityPage from './pages/DataUtilityPage';
import ContactMergePage from './pages/ContactMergePage';
import EmailFinderPage from './pages/EmailFinderPage';
import MissingEmailsPage from './pages/MissingEmailsPage';
import MergedDuplicatesPage from './pages/MergedDuplicatesPage';
import ExportDataPage from './pages/ExportDataPage';

// Create ultra-modern, professional theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#8b5cf6',
      dark: '#6d28d9',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#059669',
      light: '#10b981',
      dark: '#047857',
    },
    error: {
      main: '#dc2626',
      light: '#ef4444',
      dark: '#b91c1c',
    },
    warning: {
      main: '#d97706',
      light: '#f59e0b',
      dark: '#b45309',
    },
    info: {
      main: '#0284c7',
      light: '#0ea5e9',
      dark: '#0369a1',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.1,
      letterSpacing: '-0.05em',
      background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
    '0 0 0 1px rgba(255, 255, 255, 0.05), 0 32px 64px -12px rgba(0, 0, 0, 0.4)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cbd5e1',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: '#94a3b8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '0.875rem',
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: '#e2e8f0',
          color: '#475569',
          '&:hover': {
            borderWidth: '2px',
            borderColor: '#2563eb',
            background: 'rgba(37, 99, 235, 0.04)',
            color: '#2563eb',
          },
        },
        text: {
          color: '#475569',
          '&:hover': {
            background: 'rgba(37, 99, 235, 0.04)',
            color: '#2563eb',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            borderColor: 'rgba(37, 99, 235, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#2563eb',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          color: '#0f172a',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 32,
          '&.MuiChip-filled': {
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: 'white',
          },
          '&.MuiChip-outlined': {
            borderWidth: '2px',
            borderColor: '#e2e8f0',
            '&:hover': {
              borderColor: '#2563eb',
              background: 'rgba(37, 99, 235, 0.04)',
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          borderColor: 'rgba(5, 150, 105, 0.2)',
          color: '#047857',
        },
        standardError: {
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          borderColor: 'rgba(220, 38, 38, 0.2)',
          color: '#b91c1c',
        },
        standardWarning: {
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          borderColor: 'rgba(217, 119, 6, 0.2)',
          color: '#b45309',
        },
        standardInfo: {
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          borderColor: 'rgba(2, 132, 199, 0.2)',
          color: '#0369a1',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.95)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: '#0f172a',
            borderBottom: '2px solid #e2e8f0',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.02)',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
          padding: '16px',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 700,
          fontSize: '0.875rem',
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 12,
            fontWeight: 600,
            margin: '0 4px',
            '&.Mui-selected': {
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            },
            '&:hover': {
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#e2e8f0',
            borderWidth: '2px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#2563eb',
            borderWidth: '2px',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: '#e2e8f0',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: '#cbd5e1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '2px',
            },
          },
        },
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          marginTop: 8,
        },
        option: {
          borderRadius: 8,
          margin: '4px 8px',
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
          },
          '&[aria-selected="true"]': {
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          marginTop: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: 'rgba(37, 99, 235, 0.08)',
          },
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          '& .MuiStepLabel-root .Mui-completed': {
            color: '#059669',
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: '#2563eb',
          },
          '& .MuiStepLabel-label': {
            fontWeight: 600,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="contacts" element={<ContactListPage />} />
              <Route path="contacts/new" element={<CreateContactPage />} />
              <Route path="/contacts/merge" element={<ContactMergePage />} />              
              <Route path="contacts/:id" element={<ContactDetailPage />} />
              <Route path="contacts/:id/edit" element={<ContactEditPage />} />
              <Route path="companies" element={<CompanyListPage />} />
              <Route path="companies/new" element={<CreateCompanyPage />} />
              <Route path="import" element={<ImportDataPage />} />
              <Route path="/export" element={<ExportDataPage />} />
              <Route path="data-utility" element={<DataUtilityPage />} />
              <Route path="email-finder/:id" element={<EmailFinderPage />} />
              <Route path="missing-emails" element={<MissingEmailsPage />} />
              <Route path="merged-duplicates" element={<MergedDuplicatesPage />} />
            </Route>
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;