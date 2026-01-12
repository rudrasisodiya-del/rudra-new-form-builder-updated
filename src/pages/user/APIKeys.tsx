import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  IconButton,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Key as KeyIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const APIKeys = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  const handleRegenerateKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
      return;
    }
    setRegenerating(true);
    try {
      const response = await api.post('/auth/regenerate-api-key');
      setUser({ ...user, apiKey: response.data.apiKey });
      alert('API key regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key');
    } finally {
      setRegenerating(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return '';
    return `${key.substring(0, 8)}${'•'.repeat(24)}${key.substring(key.length - 8)}`;
  };

  const apiEndpoints = [
    { method: 'GET', path: '/api/v1/forms', description: 'Get all your forms', color: '#10b981' },
    { method: 'GET', path: '/api/v1/forms/:id', description: 'Get a specific form with submissions', color: '#10b981' },
    { method: 'GET', path: '/api/v1/forms/:id/submissions', description: 'Get submissions for a form', color: '#10b981' },
    { method: 'GET', path: '/api/v1/submissions/:id', description: 'Get a specific submission', color: '#10b981' },
    { method: 'GET', path: '/api/v1/webhooks', description: 'Get all webhooks', color: '#10b981' },
    { method: 'GET', path: '/api/v1/usage', description: 'Get API usage statistics', color: '#06b6d4' },
  ];

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* API Key Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #1a73e8 0%, #06b6d4 100%)',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <KeyIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Your API Key
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Use this key to authenticate API requests
                        </Typography>
                      </Box>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleRegenerateKey}
                      disabled={regenerating}
                      sx={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#dc2626',
                          bgcolor: alpha('#ef4444', 0.05),
                        },
                      }}
                    >
                      {regenerating ? 'Regenerating...' : 'Regenerate'}
                    </Button>
                  </Stack>

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha('#1a73e8', 0.05),
                      border: `2px dashed ${alpha('#1a73e8', 0.2)}`,
                      mb: 2,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        fullWidth
                        value={showKey ? (user?.apiKey || 'No API key available') : maskApiKey(user?.apiKey || '')}
                        InputProps={{
                          readOnly: true,
                          sx: {
                            fontFamily: 'Monaco, monospace',
                            fontSize: '0.9rem',
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => setShowKey(!showKey)}
                        sx={{
                          color: '#1a73e8',
                          '&:hover': {
                            bgcolor: alpha('#1a73e8', 0.1),
                          },
                        }}
                      >
                        {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                      <Button
                        variant="contained"
                        startIcon={<CopyIcon />}
                        onClick={() => copyToClipboard(user?.apiKey)}
                        sx={{
                          background: 'linear-gradient(135deg, #1a73e8 0%, #06b6d4 100%)',
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 3,
                          whiteSpace: 'nowrap',
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha('#1a73e8', 0.3)}`,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 16px ${alpha('#1a73e8', 0.4)}`,
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        Copy
                      </Button>
                    </Stack>
                  </Box>

                  <Alert
                    severity="warning"
                    icon={<SecurityIcon fontSize="inherit" />}
                    sx={{ borderRadius: 2 }}
                  >
                    Keep your API key secure and never share it publicly. Regenerating your key will invalidate the old one.
                  </Alert>
                </CardContent>
              </Card>

              {/* API Usage Example */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <CodeIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        API Usage Example
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Include your API key in the Authorization header
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper
                    sx={{
                      bgcolor: '#1e293b',
                      p: 3,
                      borderRadius: 2,
                      overflow: 'auto',
                    }}
                  >
                    <code
                      style={{
                        color: '#e2e8f0',
                        fontFamily: 'Monaco, monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre',
                        display: 'block',
                      }}
                    >
                      {`curl -H "X-API-Key: ${user?.apiKey || 'YOUR_API_KEY'}" \\
     http://localhost:5000/api/v1/forms`}
                    </code>
                  </Paper>
                </CardContent>
              </Card>

              {/* Available Endpoints */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Avatar
                      sx={{
                        background: 'linear-gradient(135deg, #4285f4 0%, #a78bfa 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Available Endpoints
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Access your form data programmatically
                      </Typography>
                    </Box>
                  </Stack>

                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha('#1a73e8', 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Endpoint</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiEndpoints.map((endpoint, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha('#1a73e8', 0.02),
                              },
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={endpoint.method}
                                size="small"
                                sx={{
                                  bgcolor: alpha(endpoint.color, 0.1),
                                  color: endpoint.color,
                                  fontWeight: 700,
                                  fontFamily: 'Monaco, monospace',
                                  fontSize: '0.75rem',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <code style={{ fontSize: '0.875rem', color: theme.palette.text.primary }}>
                                {endpoint.path}
                              </code>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {endpoint.description}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* Rate Limits Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                    <TrendingUpIcon sx={{ color: '#1a73e8' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Rate Limits
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Requests per minute
                        </Typography>
                        <Chip
                          label={user?.plan?.name === 'Free' ? '60' : user?.plan?.name === 'Pro' ? '300' : '1000'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                      <Divider />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Requests per hour
                        </Typography>
                        <Chip
                          label={user?.plan?.name === 'Free' ? '1,000' : user?.plan?.name === 'Pro' ? '10,000' : '50,000'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#06b6d4', 0.1),
                            color: '#06b6d4',
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                      <Divider />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Current plan
                        </Typography>
                        <Chip
                          label={user?.plan?.name || 'Free'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#1a73e8', 0.1),
                            color: '#1a73e8',
                            fontWeight: 700,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => window.location.href = '/dashboard/pricing'}
                    sx={{
                      mt: 3,
                      background: 'linear-gradient(135deg, #1a73e8 0%, #06b6d4 100%)',
                      textTransform: 'none',
                      fontWeight: 700,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 16px ${alpha('#1a73e8', 0.3)}`,
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Upgrade Plan
                  </Button>
                </CardContent>
              </Card>

              {/* Documentation Card */}
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
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <DescriptionIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Typography variant="h6" color="white" fontWeight={700}>
                      API Documentation
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', mb: 3 }}>
                    Learn how to integrate our API into your applications with comprehensive documentation and examples.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
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
                    View Documentation
                  </Button>
                </CardContent>
              </Card>

              {/* Best Practices Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <SecurityIcon sx={{ color: '#10b981' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Best Practices
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" color="text.secondary">
                      • Store API keys securely in environment variables
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Never commit API keys to version control
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Rotate keys regularly for better security
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Use HTTPS for all API requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Handle rate limit errors gracefully
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Success Snackbar */}
        <Snackbar
          open={copied}
          autoHideDuration={2000}
          onClose={() => setCopied(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setCopied(false)}
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[8],
            }}
          >
            API key copied to clipboard!
          </Alert>
        </Snackbar>
      </Box>
    </UserLayout>
  );
};

export default APIKeys;
