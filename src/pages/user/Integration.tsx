import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Grid,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Modal,
  TextField,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Webhook as WebhookIcon,
  Key as KeyIcon,
  Code as CodeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const Integration = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [configModal, setConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableIntegrations = [
    {
      name: 'Google Sheets',
      description: 'Send form submissions directly to Google Sheets',
      icon: '📊',
      status: 'available',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      popular: true,
    },
    {
      name: 'Slack',
      description: 'Get notified in Slack when someone submits a form',
      icon: '💬',
      status: 'available',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      popular: true,
    },
    {
      name: 'Webhooks',
      description: 'Send form data to any endpoint via HTTP POST',
      icon: '🔗',
      status: 'active',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      popular: true,
    },
    {
      name: 'Mailchimp',
      description: 'Add form respondents to your Mailchimp lists',
      icon: '📧',
      status: 'available',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      popular: false,
    },
    {
      name: 'Zapier',
      description: 'Connect to 5000+ apps through Zapier',
      icon: '⚡',
      status: 'available',
      gradient: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      popular: true,
    },
    {
      name: 'Dropbox',
      description: 'Store file uploads in your Dropbox account',
      icon: '📦',
      status: 'available',
      gradient: 'linear-gradient(135deg, #0061ff 0%, #0051d5 100%)',
      popular: false,
    },
    {
      name: 'Google Drive',
      description: 'Save form submissions and files to Google Drive',
      icon: '💾',
      status: 'available',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      popular: false,
    },
    {
      name: 'Airtable',
      description: 'Send submissions to your Airtable base',
      icon: '🗂️',
      status: 'available',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      popular: false,
    },
    {
      name: 'Stripe',
      description: 'Accept payments through your forms',
      icon: '💳',
      status: 'available',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      popular: true,
    },
    {
      name: 'PayPal',
      description: 'Accept PayPal payments in your forms',
      icon: '💰',
      status: 'available',
      gradient: 'linear-gradient(135deg, #0070ba 0%, #003087 100%)',
      popular: false,
    },
    {
      name: 'HubSpot',
      description: 'Sync form data with HubSpot CRM',
      icon: '🎯',
      status: 'available',
      gradient: 'linear-gradient(135deg, #ff7a59 0%, #ff5c35 100%)',
      popular: false,
    },
    {
      name: 'Salesforce',
      description: 'Send leads directly to Salesforce',
      icon: '☁️',
      status: 'available',
      gradient: 'linear-gradient(135deg, #00a1e0 0%, #0176d3 100%)',
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

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <Typography color="text.secondary">Loading integrations...</Typography>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff'} 0%, ${theme.palette.mode === 'dark' ? '#0f172a' : '#f8fafc'} 100%)`,
            borderRadius: 3,
            p: 4,
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#6366f1', 0.1)} 0%, transparent 70%)`,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Integrations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connect your forms with your favorite tools and services
            </Typography>
          </Box>
        </Box>

        {/* Popular Integrations */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
            <StarIcon sx={{ color: '#f59e0b', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Popular Integrations
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {popularIntegrations.map((integration) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.name}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: integration.gradient,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          fontSize: '2rem',
                          background: integration.gradient,
                        }}
                      >
                        {integration.icon}
                      </Avatar>
                      <Chip
                        label={integration.status === 'active' ? 'Active' : 'Available'}
                        size="small"
                        icon={integration.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : undefined}
                        sx={{
                          bgcolor: integration.status === 'active'
                            ? alpha('#10b981', 0.1)
                            : alpha('#6366f1', 0.1),
                          color: integration.status === 'active' ? '#10b981' : '#6366f1',
                          fontWeight: 700,
                          borderRadius: 1.5,
                        }}
                      />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {integration.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                      {integration.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleConnect(integration)}
                      sx={{
                        background: integration.status === 'active'
                          ? alpha(theme.palette.divider, 0.1)
                          : integration.gradient,
                        color: integration.status === 'active' ? 'text.primary' : 'white',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: integration.status === 'active' ? 'none' : `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: integration.status === 'active'
                            ? theme.shadows[2]
                            : `0 6px 16px ${alpha('#6366f1', 0.4)}`,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      {integration.status === 'active' ? 'Manage' : 'Connect'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Other Integrations */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
            All Integrations
          </Typography>
          <Grid container spacing={3}>
            {otherIntegrations.map((integration) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={integration.name}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          fontSize: '1.5rem',
                          background: integration.gradient,
                        }}
                      >
                        {integration.icon}
                      </Avatar>
                      <Chip
                        label="Available"
                        size="small"
                        sx={{
                          bgcolor: alpha('#6366f1', 0.1),
                          color: '#6366f1',
                          fontWeight: 700,
                          borderRadius: 1.5,
                        }}
                      />
                    </Stack>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {integration.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
                      {integration.description}
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleConnect(integration)}
                      sx={{
                        borderColor: alpha('#6366f1', 0.3),
                        color: '#6366f1',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        '&:hover': {
                          borderColor: '#6366f1',
                          bgcolor: alpha('#6366f1', 0.05),
                        },
                      }}
                    >
                      Connect
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Custom Integration Banner */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 24px ${alpha('#6366f1', 0.4)}`,
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
                      color: '#6366f1',
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
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      fontSize: '1.5rem',
                      background: selectedIntegration?.gradient,
                    }}
                  >
                    {selectedIntegration?.icon}
                  </Avatar>
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
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
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
