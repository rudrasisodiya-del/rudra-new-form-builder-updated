import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Paper,
  useTheme,
  alpha,
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
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
    { method: 'GET', path: '/api/v1/forms', description: 'Get all your forms' },
    { method: 'GET', path: '/api/v1/forms/:id', description: 'Get a specific form' },
    { method: 'GET', path: '/api/v1/forms/:id/submissions', description: 'Get form submissions' },
    { method: 'GET', path: '/api/v1/submissions/:id', description: 'Get a submission' },
    { method: 'GET', path: '/api/v1/webhooks', description: 'Get all webhooks' },
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
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* API Key Section */}
        <Card
          sx={{
            mb: 3,
            background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
            borderRadius: 3,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: alpha('#1a73e8', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <KeyIcon sx={{ fontSize: 24, color: '#1a73e8' }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                    Your API Key
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
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
                  borderRadius: 2,
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
                p: 2,
                borderRadius: 2,
                bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc',
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                mb: 3,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TextField
                  fullWidth
                  value={showKey ? (user?.apiKey || 'No API key available') : maskApiKey(user?.apiKey || '')}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      fontFamily: 'Monaco, Consolas, monospace',
                      fontSize: '0.875rem',
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      bgcolor: 'transparent',
                      color: isDark ? '#fff' : '#1e293b',
                    },
                  }}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={() => setShowKey(!showKey)}
                  sx={{
                    color: isDark ? alpha('#fff', 0.7) : '#64748b',
                    '&:hover': { bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.04) },
                  }}
                >
                  {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
                <Button
                  variant="contained"
                  startIcon={<CopyIcon />}
                  onClick={() => copyToClipboard(user?.apiKey)}
                  sx={{
                    bgcolor: '#1a73e8',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    borderRadius: 2,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#1557b0',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Copy
                </Button>
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#f59e0b', 0.08),
                border: '1px solid',
                borderColor: alpha('#f59e0b', 0.2),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <SecurityIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.8) : '#78350f' }}>
                  Keep your API key secure. Never share it publicly or commit to version control.
                </Typography>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Usage Example */}
              <Card
                sx={{
                  background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  borderRadius: 3,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha('#06b6d4', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CodeIcon sx={{ fontSize: 24, color: '#06b6d4' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                        Quick Start
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
                        Include your API key in the X-API-Key header
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
                        fontFamily: 'Monaco, Consolas, monospace',
                        fontSize: '0.8rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre',
                        display: 'block',
                      }}
                    >
{`curl -X GET \\
  -H "X-API-Key: ${user?.apiKey ? user.apiKey.substring(0, 20) + '...' : 'YOUR_API_KEY'}" \\
  http://localhost:5000/api/v1/forms`}
                    </code>
                  </Paper>
                </CardContent>
              </Card>

              {/* Endpoints Table */}
              <Card
                sx={{
                  background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  borderRadius: 3,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: alpha('#10b981', 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DescriptionIcon sx={{ fontSize: 24, color: '#10b981' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                        Available Endpoints
                      </Typography>
                      <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
                        Access your form data programmatically
                      </Typography>
                    </Box>
                  </Stack>

                  <TableContainer
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 600, color: isDark ? alpha('#fff', 0.7) : '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Method</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: isDark ? alpha('#fff', 0.7) : '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Endpoint</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: isDark ? alpha('#fff', 0.7) : '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {apiEndpoints.map((endpoint, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:last-child td': { borderBottom: 0 },
                              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc' },
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={endpoint.method}
                                size="small"
                                sx={{
                                  bgcolor: alpha('#10b981', 0.1),
                                  color: '#10b981',
                                  fontWeight: 700,
                                  fontFamily: 'Monaco, monospace',
                                  fontSize: '0.7rem',
                                  height: 24,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                sx={{
                                  fontFamily: 'Monaco, Consolas, monospace',
                                  fontSize: '0.8rem',
                                  color: isDark ? '#fff' : '#1e293b',
                                }}
                              >
                                {endpoint.path}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
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
              {/* Rate Limits */}
              <Card
                sx={{
                  background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  borderRadius: 3,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <TrendingUpIcon sx={{ color: '#1a73e8', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                      Rate Limits
                    </Typography>
                  </Stack>

                  <Stack spacing={2.5}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
                        Requests / minute
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                        60
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
                        Requests / day
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                        10,000
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.6) : '#64748b' }}>
                        Current plan
                      </Typography>
                      <Chip
                        label="Free"
                        size="small"
                        sx={{
                          bgcolor: alpha('#1a73e8', 0.1),
                          color: '#1a73e8',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 24,
                        }}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card
                sx={{
                  background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                  borderRadius: 3,
                  boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <SecurityIcon sx={{ color: '#10b981', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : '#1e293b' }}>
                      Best Practices
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    {[
                      'Store API keys in environment variables',
                      'Never commit keys to version control',
                      'Rotate keys regularly',
                      'Use HTTPS for all requests',
                      'Handle rate limits gracefully',
                    ].map((tip, index) => (
                      <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                        <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.7) : '#475569' }}>
                          {tip}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Documentation Link */}
              <Card
                sx={{
                  background: '#1a73e8',
                  borderRadius: 3,
                  boxShadow: 'none',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <DescriptionIcon sx={{ color: 'white', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
                      Documentation
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mb: 3 }}>
                    Learn more about our API with comprehensive guides and examples.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/dashboard/api-docs')}
                    sx={{
                      bgcolor: 'white',
                      color: '#1a73e8',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.25,
                      borderRadius: 2,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    View Docs
                  </Button>
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
            sx={{ borderRadius: 2 }}
          >
            API key copied to clipboard!
          </Alert>
        </Snackbar>
      </Box>
    </UserLayout>
  );
};

export default APIKeys;
