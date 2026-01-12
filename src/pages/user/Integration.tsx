import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  useTheme,
  alpha,
  Modal,
  TextField,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Webhook as WebhookIcon,
  Key as KeyIcon,
  Code as CodeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';

// Real brand logos as SVG components
const GoogleSheetsLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#43a047" d="M37 45H11c-2.2 0-4-1.8-4-4V7c0-2.2 1.8-4 4-4h19l11 11v27c0 2.2-1.8 4-4 4z"/>
    <path fill="#c8e6c9" d="M40 14H30V4l10 10z"/>
    <path fill="#fff" d="M30 22H18v12h12V22zm-10 2h3v3h-3v-3zm0 5h3v3h-3v-3zm5-5h3v3h-3v-3zm0 5h3v3h-3v-3z"/>
  </svg>
);

const SlackLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#33d375" d="M33 8a4 4 0 0 0-8 0v11h4a4 4 0 0 0 4-4V8z"/>
    <path fill="#33d375" d="M43 19a4 4 0 0 0-4-4h-4v4a4 4 0 0 0 4 4h4v-4z"/>
    <path fill="#40c4ff" d="M8 15a4 4 0 0 0 0 8h11v-4a4 4 0 0 0-4-4H8z"/>
    <path fill="#40c4ff" d="M19 5a4 4 0 0 0-4 4v4h4a4 4 0 0 0 4-4V5h-4z"/>
    <path fill="#e91e63" d="M15 40a4 4 0 0 0 8 0V29h-4a4 4 0 0 0-4 4v7z"/>
    <path fill="#e91e63" d="M5 29a4 4 0 0 0 4 4h4v-4a4 4 0 0 0-4-4H5v4z"/>
    <path fill="#ffc107" d="M40 33a4 4 0 0 0 0-8H29v4a4 4 0 0 0 4 4h7z"/>
    <path fill="#ffc107" d="M29 43a4 4 0 0 0 4-4v-4h-4a4 4 0 0 0-4 4v4h4z"/>
  </svg>
);

const WebhookLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="24" r="20" fill="#1a73e8"/>
    <path fill="#fff" d="M24 14c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm0 16c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
    <circle cx="24" cy="24" r="3" fill="#fff"/>
    <path fill="#fff" d="M24 10v4M24 34v4M10 24h4M34 24h4" stroke="#fff" strokeWidth="2"/>
  </svg>
);

const ZapierLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="24" r="20" fill="#ff4a00"/>
    <path fill="#fff" d="M32 18l-6 6 6 6h-6l-3-3-3 3h-6l6-6-6-6h6l3 3 3-3h6z"/>
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <rect width="48" height="48" rx="8" fill="#635bff"/>
    <path fill="#fff" d="M24 16.5c-3.4 0-5.6 1.8-5.6 4.5 0 3.5 5.1 3.9 5.1 5.9 0 .8-.7 1.1-1.7 1.1-1.5 0-3.4-.6-4.9-1.5v3.6c1.7.7 3.4 1 4.9 1 3.5 0 5.8-1.7 5.8-4.5 0-3.7-5.1-4.1-5.1-6 0-.7.6-1 1.5-1 1.3 0 3 .5 4.2 1.2v-3.5c-1.4-.5-2.8-.8-4.2-.8z"/>
  </svg>
);

const MailchimpLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="24" r="20" fill="#ffe01b"/>
    <path fill="#000" d="M24 14c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-3 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm6 0c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-3 10c-2.8 0-5-1.3-5-3h10c0 1.7-2.2 3-5 3z"/>
  </svg>
);

const DropboxLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#1e88e5" d="M24 4L12 12l12 8-12 8 12 8 12-8-12-8 12-8-12-8zM12 28l12 8 12-8"/>
  </svg>
);

const GoogleDriveLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#ffc107" d="M17 7l-12 21h10l12-21z"/>
    <path fill="#1976d2" d="M43 28H17l-5 9h26z"/>
    <path fill="#4caf50" d="M38 7H17l12 21h14z"/>
  </svg>
);

const AirtableLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <rect width="48" height="48" rx="8" fill="#fcb400"/>
    <path fill="#fff" d="M12 16h24v4H12zM12 24h24v4H12zM12 32h16v4H12z"/>
  </svg>
);

const PayPalLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#1565c0" d="M37 18c0-6-5-10-11-10H16c-1 0-2 1-2 2l-4 26c0 1 0 1 1 1h6l2-10v1c0-1 1-2 2-2h4c7 0 12-3 13-10 0 0 0-1 0-1"/>
    <path fill="#039be5" d="M38 18c-1 7-6 10-13 10h-4c-1 0-2 1-2 2v-1l-2 10h6c1 0 2-1 2-2l1-8h3c6 0 10-2 11-8v-3"/>
  </svg>
);

const HubSpotLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="24" r="20" fill="#ff7a59"/>
    <path fill="#fff" d="M30 18v-3c1.1-.5 2-1.6 2-3 0-1.7-1.3-3-3-3s-3 1.3-3 3c0 1.4.9 2.5 2 3v3c-2.8.5-5 2.9-5 5.8 0 1.5.5 2.8 1.4 3.9l-3.1 3.1c-.1 0-.2-.1-.3-.1-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.1 0-.2-.1-.3l3.1-3.1c1.1.9 2.4 1.4 3.9 1.4 3.3 0 6-2.7 6-6 .1-2.9-2.1-5.2-4.9-5.7z"/>
  </svg>
);

const SalesforceLogo = () => (
  <svg viewBox="0 0 48 48" width="40" height="40">
    <path fill="#00a1e0" d="M20 8c-4 0-7 3-7 7 0 1 0 2 .5 3-3.5 1-6.5 4.5-6.5 8.5 0 5 4 9 9 9h20c4 0 8-3.5 8-8 0-3-1.5-5.5-4-7 0-5-4-9-9-9-2 0-4 1-5.5 2.5C23.5 10.5 22 8 20 8z"/>
  </svg>
);

const Integration = () => {
  const [configModal, setConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const theme = useTheme();

  const availableIntegrations = [
    {
      name: 'Google Sheets',
      description: 'Send form submissions directly to Google Sheets',
      Logo: GoogleSheetsLogo,
      status: 'available',
      popular: true,
    },
    {
      name: 'Slack',
      description: 'Get notified in Slack when someone submits a form',
      Logo: SlackLogo,
      status: 'available',
      popular: true,
    },
    {
      name: 'Webhooks',
      description: 'Send form data to any endpoint via HTTP POST',
      Logo: WebhookLogo,
      status: 'active',
      popular: true,
    },
    {
      name: 'Mailchimp',
      description: 'Add form respondents to your Mailchimp lists',
      Logo: MailchimpLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'Zapier',
      description: 'Connect to 5000+ apps through Zapier',
      Logo: ZapierLogo,
      status: 'available',
      popular: true,
    },
    {
      name: 'Dropbox',
      description: 'Store file uploads in your Dropbox account',
      Logo: DropboxLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'Google Drive',
      description: 'Save form submissions and files to Google Drive',
      Logo: GoogleDriveLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'Airtable',
      description: 'Send submissions to your Airtable base',
      Logo: AirtableLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'Stripe',
      description: 'Accept payments through your forms',
      Logo: StripeLogo,
      status: 'available',
      popular: true,
    },
    {
      name: 'PayPal',
      description: 'Accept PayPal payments in your forms',
      Logo: PayPalLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'HubSpot',
      description: 'Sync form data with HubSpot CRM',
      Logo: HubSpotLogo,
      status: 'available',
      popular: false,
    },
    {
      name: 'Salesforce',
      description: 'Send leads directly to Salesforce',
      Logo: SalesforceLogo,
      status: 'available',
      popular: false,
    },
  ];

  const handleConnect = (integration: any) => {
    if (integration.name === 'Webhooks') {
      window.location.href = '/dashboard/webhooks';
    } else {
      setSelectedIntegration(integration);
      setConfigModal(true);
    }
  };

  const popularIntegrations = availableIntegrations.filter(i => i.popular);
  const otherIntegrations = availableIntegrations.filter(i => !i.popular);

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Popular Integrations */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <StarIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Popular Integrations
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {popularIntegrations.map((integration) => {
              const LogoComponent = integration.Logo;
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.name}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#1a73e8',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: '#f8fafc',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LogoComponent />
                        </Box>
                        <Chip
                          label={integration.status === 'active' ? 'Active' : 'Available'}
                          size="small"
                          icon={integration.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                          sx={{
                            bgcolor: integration.status === 'active'
                              ? alpha('#10b981', 0.1)
                              : alpha('#1a73e8', 0.08),
                            color: integration.status === 'active' ? '#10b981' : '#1a73e8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      </Stack>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, color: '#1e293b' }}>
                        {integration.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: '#64748b' }}>
                        {integration.description}
                      </Typography>
                      <Button
                        fullWidth
                        variant={integration.status === 'active' ? 'outlined' : 'contained'}
                        onClick={() => handleConnect(integration)}
                        sx={{
                          bgcolor: integration.status === 'active' ? 'transparent' : '#1a73e8',
                          color: integration.status === 'active' ? '#475569' : 'white',
                          borderColor: integration.status === 'active' ? '#e2e8f0' : '#1a73e8',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.25,
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: integration.status === 'active' ? '#f8fafc' : '#1557b0',
                            borderColor: integration.status === 'active' ? '#cbd5e1' : '#1557b0',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        {integration.status === 'active' ? 'Manage' : 'Connect'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Other Integrations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            All Integrations
          </Typography>
          <Grid container spacing={3}>
            {otherIntegrations.map((integration) => {
              const LogoComponent = integration.Logo;
              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.name}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#1a73e8',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: '#f8fafc',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LogoComponent />
                        </Box>
                        <Chip
                          label="Available"
                          size="small"
                          sx={{
                            bgcolor: alpha('#1a73e8', 0.08),
                            color: '#1a73e8',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                          }}
                        />
                      </Stack>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, color: '#1e293b' }}>
                        {integration.name}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, minHeight: 40, color: '#64748b' }}>
                        {integration.description}
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleConnect(integration)}
                        sx={{
                          bgcolor: '#1a73e8',
                          color: 'white',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.25,
                          borderRadius: 2,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: '#1557b0',
                            boxShadow: 'none',
                          },
                        }}
                      >
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {/* Custom Integration Banner */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha('#1a73e8', 0.4)}`,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            },
          }}
        >
          <CardContent sx={{ p: 6, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" color="white" fontWeight={800}>
                      Need a Custom Integration?
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', mt: 1 }}>
                      Use our powerful API and Webhooks to build custom integrations with any service
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<KeyIcon />}
                    onClick={() => window.location.href = '/dashboard/api-keys'}
                    sx={{
                      bgcolor: 'white',
                      color: '#1a73e8',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.95)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    View API Keys
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<WebhookIcon />}
                    onClick={() => window.location.href = '/dashboard/webhooks'}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.5)',
                      color: 'white',
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Manage Webhooks
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Configuration Modal */}
        <Modal
          open={configModal}
          onClose={() => setConfigModal(false)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Card
            sx={{
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto',
              m: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: '#f8fafc',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedIntegration?.Logo && <selectedIntegration.Logo />}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Configure {selectedIntegration?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedIntegration?.description}
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setConfigModal(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="API Key"
                  placeholder="Enter your API key"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Workspace ID"
                  placeholder="Enter your workspace ID"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: alpha('#f59e0b', 0.1),
                    border: `1px solid ${alpha('#f59e0b', 0.3)}`,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    This integration is coming soon! You'll be able to connect {selectedIntegration?.name} to your forms in the next update.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => setConfigModal(false)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled
                    sx={{
                      bgcolor: '#1a73e8',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#1557b0',
                      },
                    }}
                  >
                    Connect
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Modal>
      </Box>
    </UserLayout>
  );
};

export default Integration;
