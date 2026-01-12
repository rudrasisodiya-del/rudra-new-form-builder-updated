import { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Button,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme as useMuiTheme,
  alpha,
  Divider,
  Stack,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Inbox as InboxIcon,
  BarChart as AnalyticsIcon,
  Share as ShareIcon,
  Extension as ExtensionIcon,
  VpnKey as KeyIcon,
  Webhook as WebhookIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  PowerSettingsNew as LogoutIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

interface UserLayoutProps {
  children: ReactNode;
}

const DRAWER_WIDTH = 280;

const UserLayout = ({ children }: UserLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path: string) => {
    // Exact match for /dashboard to avoid matching sub-routes
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For other routes, match exact or sub-routes
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    { path: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/dashboard/forms', icon: <DescriptionIcon />, label: 'My Forms' },
    { path: '/dashboard/submissions', icon: <InboxIcon />, label: 'Submissions' },
    { path: '/dashboard/analytics', icon: <AnalyticsIcon />, label: 'Analytics' },
    { path: '/dashboard/share', icon: <ShareIcon />, label: 'Share' },
    { path: '/dashboard/integration', icon: <ExtensionIcon />, label: 'Integrations' },
    { path: '/dashboard/api-keys', icon: <KeyIcon />, label: 'API Keys' },
    { path: '/dashboard/webhooks', icon: <WebhookIcon />, label: 'Webhooks' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Modern Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
            borderRight: `1px solid ${muiTheme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDarkMode ? 'none' : '0 0 20px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              {/* Pabbly Logo */}
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/pabbly-logo.png"
                  alt="Pabbly Logo"
                  style={{ width: '42px', height: '42px', borderRadius: '8px' }}
                />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
                  Pabbly Forms
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  Form Builder
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Box>

        <Divider sx={{ mx: 2 }} />

        {/* Navigation */}
        <List sx={{ flex: 1, px: 2, pt: 2 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  sx={{
                    minHeight: 48,
                    borderRadius: '12px',
                    px: 2,
                    py: 1.5,
                    color: active ? 'primary.main' : 'text.secondary',
                    bgcolor: active ? alpha(muiTheme.palette.primary.main, 0.08) : 'transparent',
                    '&:hover': {
                      bgcolor: active
                        ? alpha(muiTheme.palette.primary.main, 0.12)
                        : alpha(muiTheme.palette.text.primary, 0.04),
                      color: active ? 'primary.main' : 'text.primary',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: 'inherit',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 'inherit',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ mx: 2 }} />

        {/* Sidebar Footer */}
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            {/* Settings */}
            <ListItemButton
              component={Link}
              to="/dashboard/settings"
              sx={{
                borderRadius: '12px',
                px: 2,
                py: 1.5,
                color: isActive('/dashboard/settings') ? 'primary.main' : 'text.secondary',
                bgcolor: isActive('/dashboard/settings')
                  ? alpha(muiTheme.palette.primary.main, 0.08)
                  : 'transparent',
                '&:hover': {
                  bgcolor: alpha(muiTheme.palette.text.primary, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>

            {/* Help */}
            <ListItemButton
              component={Link}
              to="/dashboard/help"
              sx={{
                borderRadius: '12px',
                px: 2,
                py: 1.5,
                color: isActive('/dashboard/help') ? 'primary.main' : 'text.secondary',
                bgcolor: isActive('/dashboard/help')
                  ? alpha(muiTheme.palette.primary.main, 0.08)
                  : 'transparent',
                '&:hover': {
                  bgcolor: alpha(muiTheme.palette.text.primary, 0.04),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText
                primary="Help & Support"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </Stack>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Modern Top Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: isDarkMode ? '#1e293b' : '#ffffff',
            borderBottom: `1px solid ${muiTheme.palette.divider}`,
            boxShadow: isDarkMode ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', px: 4, minHeight: '70px !important' }}>
            {/* Search or Breadcrumb */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Dark Mode Toggle */}
              <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: alpha(muiTheme.palette.primary.main, 0.12),
                    },
                  }}
                >
                  {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Tooltip>

              {/* Upgrade Button */}
              <Button
                variant="contained"
                component={Link}
                to="/pricing"
                sx={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                  },
                }}
              >
                Upgrade Pro
              </Button>

              {/* User Avatar & Logout */}
              <Tooltip title="Logout">
                <IconButton
                  onClick={handleLogout}
                  sx={{
                    bgcolor: alpha(muiTheme.palette.error.main, 0.08),
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: alpha(muiTheme.palette.error.main, 0.12),
                    },
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content with beautiful background */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.default',
            backgroundImage: isDarkMode
              ? 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.1) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.1) 0px, transparent 50%)'
              : 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.05) 0px, transparent 50%)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
