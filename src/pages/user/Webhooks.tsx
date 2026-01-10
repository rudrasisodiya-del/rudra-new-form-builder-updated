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
  useTheme,
  alpha,
  Modal,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
} from '@mui/material';
import {
  Webhook as WebhookIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>(['form.submitted']);
  const [creating, setCreating] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await api.get('/webhooks');
      setWebhooks(response.data.webhooks || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post('/webhooks', { url, events });
      setWebhooks([...webhooks, response.data.webhook]);
      setShowCreateModal(false);
      setUrl('');
      setEvents(['form.submitted']);
      alert('Webhook created successfully!');
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.delete(`/webhooks/${id}`);
      setWebhooks(webhooks.filter(w => w.id !== id));
      alert('Webhook deleted successfully!');
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/webhooks/${id}`, { isActive: !currentStatus });
      setWebhooks(webhooks.map(w =>
        w.id === id ? { ...w, isActive: !currentStatus } : w
      ));
    } catch (error) {
      console.error('Error toggling webhook:', error);
      alert('Failed to update webhook');
    }
  };

  const availableEvents = [
    { value: 'form.submitted', label: 'Form Submitted', description: 'Triggered when a form is submitted' },
    { value: 'form.created', label: 'Form Created', description: 'Triggered when a new form is created' },
    { value: 'form.updated', label: 'Form Updated', description: 'Triggered when a form is updated' },
    { value: 'form.deleted', label: 'Form Deleted', description: 'Triggered when a form is deleted' },
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
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box>
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
                Webhooks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Receive real-time notifications when events occur
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 2,
                boxShadow: `0 8px 16px ${alpha('#6366f1', 0.3)}`,
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 24px ${alpha('#6366f1', 0.4)}`,
                },
              }}
            >
              Create Webhook
            </Button>
          </Stack>
        </Box>

        {/* Webhooks List or Empty State */}
        {webhooks.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              p: 8,
              background: `linear-gradient(135deg, ${alpha('#6366f1', 0.05)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: '0 auto',
                mb: 3,
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              }}
            >
              <WebhookIcon sx={{ fontSize: 60, color: 'white' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              No webhooks yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Create your first webhook to start receiving real-time notifications
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                textTransform: 'none',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              Create Webhook
            </Button>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Left Column - Webhook Cards */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={3}>
                {webhooks.map((webhook) => (
                  <Card
                    key={webhook.id}
                    sx={{
                      transition: 'all 0.3s',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: theme.shadows[8],
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: webhook.isActive
                          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: webhook.isActive
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            }}
                          >
                            <WebhookIcon sx={{ fontSize: 28 }} />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{
                                mb: 0.5,
                                wordBreak: 'break-all',
                              }}
                            >
                              {webhook.url}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created {new Date(webhook.createdAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>
                        <Chip
                          icon={webhook.isActive ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
                          label={webhook.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: webhook.isActive ? alpha('#10b981', 0.1) : alpha('#6b7280', 0.1),
                            color: webhook.isActive ? '#10b981' : '#6b7280',
                            fontWeight: 700,
                            borderRadius: 1.5,
                            ml: 2,
                          }}
                        />
                      </Stack>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Events
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {webhook.events.map((event: string) => (
                            <Chip
                              key={event}
                              label={event}
                              size="small"
                              sx={{
                                bgcolor: alpha('#6366f1', 0.1),
                                color: '#6366f1',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      {webhook.secret && (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#6366f1', 0.05),
                            mb: 3,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Secret
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'Monaco, monospace',
                              fontSize: '0.75rem',
                              wordBreak: 'break-all',
                            }}
                          >
                            {webhook.secret.substring(0, 20)}...
                          </Typography>
                        </Box>
                      )}

                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          sx={{
                            borderColor: '#06b6d4',
                            color: '#06b6d4',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#0891b2',
                              bgcolor: alpha('#06b6d4', 0.05),
                            },
                          }}
                        >
                          Test
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleToggleActive(webhook.id, webhook.isActive)}
                          sx={{
                            borderColor: webhook.isActive ? '#6b7280' : '#10b981',
                            color: webhook.isActive ? '#6b7280' : '#10b981',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: webhook.isActive ? '#4b5563' : '#059669',
                              bgcolor: webhook.isActive ? alpha('#6b7280', 0.05) : alpha('#10b981', 0.05),
                            },
                          }}
                        >
                          {webhook.isActive ? 'Disable' : 'Enable'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(webhook.id)}
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
                          Delete
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={3}>
                {/* Statistics Card */}
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
                      <TrendingUpIcon sx={{ color: '#6366f1' }} />
                      <Typography variant="h6" fontWeight={700}>
                        Statistics
                      </Typography>
                    </Stack>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Total Webhooks
                          </Typography>
                          <Chip
                            label={webhooks.length}
                            size="small"
                            sx={{
                              bgcolor: alpha('#6366f1', 0.1),
                              color: '#6366f1',
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                        <Divider />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Active
                          </Typography>
                          <Chip
                            label={webhooks.filter(w => w.isActive).length}
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Inactive
                          </Typography>
                          <Chip
                            label={webhooks.filter(w => !w.isActive).length}
                            size="small"
                            sx={{
                              bgcolor: alpha('#6b7280', 0.1),
                              color: '#6b7280',
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Security Card */}
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
                      <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
                      <Typography variant="h6" color="white" fontWeight={700}>
                        Webhook Security
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', mb: 2 }}>
                      Each webhook request includes a signature in the X-Webhook-Signature header for verification.
                    </Typography>
                    <Paper
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.2)',
                        p: 2,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <code
                        style={{
                          color: 'rgba(255,255,255,0.95)',
                          fontFamily: 'Monaco, monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {`const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];`}
                      </code>
                    </Paper>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Create Webhook Modal */}
        <Modal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
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
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <WebhookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Create Webhook
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configure your webhook endpoint
                    </Typography>
                  </Box>
                </Stack>
                <IconButton onClick={() => setShowCreateModal(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              <Box component="form" onSubmit={handleCreate}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-domain.com/webhook"
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                    helperText="We'll send POST requests to this URL when events occur"
                  />

                  <Box>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 2 }}>
                      Events to Listen
                    </Typography>
                    <Stack spacing={1}>
                      {availableEvents.map((event) => (
                        <Box
                          key={event.value}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${alpha('#6366f1', events.includes(event.value) ? 0.3 : 0.1)}`,
                            bgcolor: events.includes(event.value) ? alpha('#6366f1', 0.05) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha('#6366f1', 0.05),
                            },
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={events.includes(event.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEvents([...events, event.value]);
                                  } else {
                                    setEvents(events.filter(ev => ev !== event.value));
                                  }
                                }}
                                sx={{
                                  color: '#6366f1',
                                  '&.Mui-checked': {
                                    color: '#6366f1',
                                  },
                                }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {event.label}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {event.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setShowCreateModal(false)}
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
                      type="submit"
                      variant="contained"
                      disabled={creating || events.length === 0}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        '&:disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      {creating ? 'Creating...' : 'Create Webhook'}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Modal>
      </Box>
    </UserLayout>
  );
};

export default Webhooks;
