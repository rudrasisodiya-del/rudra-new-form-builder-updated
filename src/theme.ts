import { createTheme, type Theme } from '@mui/material/styles';

// Modern color palette with vibrant, professional colors
const lightPalette = {
  primary: {
    main: '#6366f1', // Modern indigo
    light: '#818cf8',
    dark: '#4f46e5',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#06b6d4', // Vibrant cyan
    light: '#22d3ee',
    dark: '#0891b2',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  info: {
    main: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
  },
  divider: '#e2e8f0',
};

const darkPalette = {
  primary: {
    main: '#818cf8', // Lighter indigo for dark mode
    light: '#a5b4fc',
    dark: '#6366f1',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#22d3ee', // Lighter cyan for dark mode
    light: '#67e8f9',
    dark: '#06b6d4',
    contrastText: '#0f172a',
  },
  warning: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  error: {
    main: '#f87171',
    light: '#fca5a5',
    dark: '#ef4444',
  },
  success: {
    main: '#34d399',
    light: '#6ee7b7',
    dark: '#10b981',
  },
  info: {
    main: '#60a5fa',
    light: '#93c5fd',
    dark: '#3b82f6',
  },
  background: {
    default: '#0f172a', // Deep slate
    paper: '#1e293b', // Lighter slate for cards
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
  },
  divider: '#334155',
};

const commonTypography = {
  fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: {
    fontSize: '2.25rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontSize: '1.875rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  body1: {
    fontSize: '0.9375rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
  },
};

const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 600,
        borderRadius: '10px',
        padding: '10px 20px',
        fontSize: '0.875rem',
        boxShadow: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
      },
      sizeSmall: {
        padding: '6px 14px',
        fontSize: '0.8125rem',
      },
      sizeLarge: {
        padding: '12px 24px',
        fontSize: '0.9375rem',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: '12px',
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      elevation2: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 0 1px rgba(99, 102, 241, 0.2)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        fontSize: '0.8125rem',
        fontWeight: 600,
        height: '28px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '14px 16px',
        fontSize: '0.875rem',
      },
      head: {
        fontWeight: 700,
        fontSize: '0.8125rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      },
    },
  },
};

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: commonTypography,
    shape: {
      borderRadius: 12,
    },
    components: commonComponents,
  });
};

// Export default light theme for backward compatibility
export const theme = createAppTheme('light');
