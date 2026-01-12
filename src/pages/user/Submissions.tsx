import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  alpha,
  useTheme,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Fingerprint as FingerprintIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  TrendingUp as TrendingUpIcon,
  FiberManualRecord as DotIcon,
  FileDownload as FileDownloadIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Modern Animated Card Component
const AnimatedSubmissionCard = ({ submission, onView, onDelete, onUpdateStatus, index }: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'NEW':
        return {
          color: '#3b82f6',
          bg: isDark ? alpha('#3b82f6', 0.15) : '#dbeafe',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        };
      case 'RESOLVED':
        return {
          color: '#10b981',
          bg: isDark ? alpha('#10b981', 0.15) : '#d1fae5',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        };
      case 'ON_HOLD':
        return {
          color: '#f59e0b',
          bg: isDark ? alpha('#f59e0b', 0.15) : '#fef3c7',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        };
      case 'PARTIAL':
        return {
          color: '#1a73e8',
          bg: isDark ? alpha('#1a73e8', 0.15) : '#ede9fe',
          gradient: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
        };
      default:
        return {
          color: '#6b7280',
          bg: isDark ? alpha('#6b7280', 0.15) : '#f3f4f6',
          gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        };
    }
  };

  const statusConfig = getStatusConfig(submission.status);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `slideUp 0.5s ease-out ${index * 0.05}s both`,
        border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(statusConfig.color, 0.15)}`,
          borderColor: alpha(statusConfig.color, 0.3),
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: statusConfig.gradient,
        },
        '@keyframes slideUp': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pl: 3.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          {/* Left: Icon and Info */}
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: statusConfig.gradient,
                boxShadow: `0 4px 12px ${alpha(statusConfig.color, 0.25)}`,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" fontWeight={700}>
                Submission #{submission.id.substring(0, 8)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(submission.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  • {Object.keys(submission.data || {}).length} fields
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Center: Status */}
          <Select
            size="small"
            value={submission.status}
            onChange={(e) => onUpdateStatus(submission.id, e.target.value)}
            sx={{
              minWidth: 120,
              bgcolor: statusConfig.bg,
              color: statusConfig.color,
              fontWeight: 700,
              fontSize: '0.75rem',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': { py: 0.75, px: 1.5 },
              borderRadius: 1.5,
            }}
          >
            <MenuItem value="NEW">🆕 NEW</MenuItem>
            <MenuItem value="ON_HOLD">⏸️ ON HOLD</MenuItem>
            <MenuItem value="RESOLVED">✅ RESOLVED</MenuItem>
            <MenuItem value="PARTIAL">📝 PARTIAL</MenuItem>
          </Select>

          {/* Right: Actions */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => onView(submission)}
                sx={{
                  bgcolor: alpha('#1a73e8', 0.1),
                  color: '#1a73e8',
                  '&:hover': {
                    bgcolor: alpha('#1a73e8', 0.2),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <VisibilityIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(submission.id)}
                sx={{
                  bgcolor: alpha('#ef4444', 0.1),
                  color: '#ef4444',
                  '&:hover': {
                    bgcolor: alpha('#ef4444', 0.2),
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <DeleteIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Submissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string>(id || '');
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [formFields, setFormFields] = useState<any[]>([]);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      fetchSubmissions();
    }
  }, [selectedForm]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchQuery, statusFilter]);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      setForms(response.data.forms || []);
      if (response.data.forms?.length > 0 && !selectedForm) {
        setSelectedForm(response.data.forms[0].id);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/submissions/form/${selectedForm}`);
      setSubmissions(response.data.submissions || []);

      // Fetch form details to get field labels
      const formResponse = await api.get(`/forms/${selectedForm}`);
      setFormFields(formResponse.data.form?.fields || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((s) => {
        const searchLower = searchQuery.toLowerCase();
        const dateMatch = new Date(s.createdAt).toLocaleString().toLowerCase().includes(searchLower);
        const idMatch = s.id.toLowerCase().includes(searchLower);
        const dataMatch = JSON.stringify(s.data).toLowerCase().includes(searchLower);
        return dateMatch || idMatch || dataMatch;
      });
    }

    setFilteredSubmissions(filtered);
  };

  const handleUpdateStatus = async (submissionId: string, status: string) => {
    try {
      await api.put(`/submissions/${submissionId}/status`, { status });
      setSubmissions(submissions.map((s) => (s.id === submissionId ? { ...s, status } : s)));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;
    try {
      await api.delete(`/submissions/${submissionId}`);
      setSubmissions(submissions.filter((s) => s.id !== submissionId));
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const exportToCSV = () => {
    if (submissions.length === 0) return;

    const headers = Object.keys(submissions[0].data || {});
    const csvContent = [
      ['Date', 'Status', ...headers].join(','),
      ...submissions.map((sub) => [
        new Date(sub.createdAt).toLocaleDateString(),
        sub.status,
        ...headers.map((h) => JSON.stringify(sub.data[h] || '')),
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${selectedForm}-${Date.now()}.csv`;
    a.click();
  };

  const formatValue = (val: any) => {
    if (val === null || val === undefined) return 'No answer';
    if (typeof val === 'object') {
      if (val.firstName && val.lastName) {
        return `${val.firstName} ${val.lastName}`;
      }
      if (val.street || val.city || val.state || val.zip) {
        const parts = [];
        if (val.street) parts.push(val.street);
        if (val.city) parts.push(val.city);
        if (val.state) parts.push(val.state);
        if (val.zip) parts.push(val.zip);
        return parts.join(', ');
      }
      if (Array.isArray(val)) {
        return val.length > 0 ? val.join(', ') : 'No selection';
      }
      return JSON.stringify(val);
    }
    return String(val);
  };

  const getFieldLabel = (fieldId: string, index: number) => {
    // Try to find the field in the form definition
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
      return field.label || `Question ${index + 1}`;
    }

    // Fallback to fieldId or Question number
    if (/^\d+$/.test(fieldId)) {
      return `Question ${index + 1}`;
    }
    return fieldId;
  };

  const getFieldType = (fieldId: string) => {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
      return field.type;
    }
    return null;
  };

  const getFieldTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      heading: 'Heading',
      fullname: 'Full Name',
      email: 'Email',
      address: 'Address',
      phone: 'Phone',
      datepicker: 'Date',
      appointment: 'Appointment',
      signature: 'Signature',
      fillintheblank: 'Fill in Blank',
      shorttext: 'Short Text',
      longtext: 'Long Text',
      text: 'Text',
      textarea: 'Text Area',
      number: 'Number',
      dropdown: 'Dropdown',
      checkbox: 'Checkbox',
      radio: 'Radio Button',
      date: 'Date',
      file: 'File Upload',
      square: 'Square Payment',
      paypal: 'PayPal',
      stripe: 'Stripe',
      authorizenet: 'Authorize.Net',
      braintree: 'Braintree',
      formcalculation: 'Form Calculation',
      configurablelist: 'Configurable List',
      multipletextfields: 'Multiple Text Fields',
      termsandconditions: 'Terms & Conditions',
      takephoto: 'Take Photo',
      checklist: 'Checklist',
      dynamictextbox: 'Dynamic Textbox',
      addoptions: 'Add Options',
      datagrid: 'Data Grid',
      dynamicdropdowns: 'Dynamic Dropdowns',
      pdfembedder: 'PDF Embedder',
    };
    return typeLabels[type] || type;
  };

  const getStatusStats = () => {
    const stats = {
      total: submissions.length,
      new: submissions.filter((s) => s.status === 'NEW').length,
      resolved: submissions.filter((s) => s.status === 'RESOLVED').length,
      onHold: submissions.filter((s) => s.status === 'ON_HOLD').length,
      partial: submissions.filter((s) => s.status === 'PARTIAL').length,
    };
    return stats;
  };

  const stats = getStatusStats();

  // Prepare data for charts
  const getSubmissionTrend = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const count = submissions.filter((s) => {
        const submissionDate = new Date(s.createdAt).toISOString().split('T')[0];
        return submissionDate === date;
      }).length;

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: count,
      };
    });
  };

  const getStatusDistribution = () => {
    return [
      { name: 'New', value: stats.new, color: '#3b82f6' },
      { name: 'Resolved', value: stats.resolved, color: '#10b981' },
      { name: 'On Hold', value: stats.onHold, color: '#f59e0b' },
      { name: 'Partial', value: stats.partial, color: '#1a73e8' },
    ].filter((item) => item.value > 0);
  };

  const trendData = getSubmissionTrend();
  const statusData = getStatusDistribution();

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <Typography color="text.secondary">Loading submissions...</Typography>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '1600px', mx: 'auto' }}>
        {/* Actions Bar */}
        {submissions.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mb: 3 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={fetchSubmissions}
                size="small"
                sx={{
                  background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  '&:hover': {
                    background: '#1a73e8',
                    color: 'white',
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={exportToCSV}
              sx={{
                background: '#1a73e8',
                textTransform: 'none',
                fontWeight: 600,
                px: 2,
                py: 1,
                boxShadow: '0 2px 8px rgba(26, 115, 232, 0.25)',
                '&:hover': {
                  background: '#1557b0',
                  boxShadow: '0 4px 12px rgba(26, 115, 232, 0.35)',
                },
              }}
            >
              Export CSV
            </Button>
          </Stack>
        )}

        {forms.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              background: isDark
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)',
              border: `2px dashed ${isDark ? alpha('#1a73e8', 0.3) : alpha('#1a73e8', 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a73e8 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 3,
                  boxShadow: `0 8px 24px ${alpha('#1a73e8', 0.3)}`,
                }}
              >
                <DescriptionIcon sx={{ fontSize: 50, color: 'white' }} />
              </Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                No forms yet
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                Create your first form to start collecting submissions and manage responses
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dashboard/forms/builder')}
                sx={{
                  background: 'linear-gradient(135deg, #1a73e8 0%, #4f46e5 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                  },
                }}
              >
                Create Your First Form
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Form Selector */}
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, minWidth: 100 }}>
                    SELECT FORM
                  </Typography>
                  <FormControl fullWidth sx={{ maxWidth: { sm: 400 } }}>
                    <Select
                      value={selectedForm}
                      onChange={(e) => setSelectedForm(e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha('#1a73e8', 0.2),
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a73e8',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#1a73e8',
                        },
                      }}
                    >
                      {forms.map((form) => (
                        <MenuItem key={form.id} value={form.id}>
                          {form.title} ({form._count?.submissions || 0})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </CardContent>
            </Card>

            {/* Search & Filters */}
            {submissions.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        placeholder="Search submissions by ID, date, or content..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: '#1a73e8' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            '&:hover fieldset': {
                              borderColor: '#1a73e8',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1a73e8',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <FilterListIcon sx={{ color: 'text.secondary' }} />
                        <FormControl fullWidth>
                          <InputLabel>Filter by Status</InputLabel>
                          <Select
                            value={statusFilter}
                            label="Filter by Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{
                              borderRadius: 3,
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1a73e8',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#1a73e8',
                              },
                            }}
                          >
                            <MenuItem value="ALL">All Statuses</MenuItem>
                            <MenuItem value="NEW">New</MenuItem>
                            <MenuItem value="ON_HOLD">On Hold</MenuItem>
                            <MenuItem value="RESOLVED">Resolved</MenuItem>
                            <MenuItem value="PARTIAL">Partial</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Submissions List */}
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a73e8 0%, #06b6d4 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2,
                      opacity: 0.7,
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {searchQuery || statusFilter !== 'ALL'
                      ? 'No matching submissions found'
                      : 'No submissions yet'}
                  </Typography>
                  <Typography color="text.secondary">
                    {searchQuery || statusFilter !== 'ALL'
                      ? 'Try adjusting your search or filter criteria'
                      : 'When users submit your form, they will appear here.'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={2}>
                {filteredSubmissions.map((submission, index) => (
                  <AnimatedSubmissionCard
                    key={submission.id}
                    submission={submission}
                    index={index}
                    onView={setSelectedSubmission}
                    onDelete={handleDelete}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
              </Stack>
            )}

            {/* Stats Cards */}
            {submissions.length > 0 && (
              <Grid container spacing={2} mt={4} mb={3}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc', borderLeft: `4px solid #1a73e8` }}>
                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="text.primary" mb={0.5}>
                        {stats.total}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                        Total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc', borderLeft: `4px solid #3b82f6` }}>
                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="text.primary" mb={0.5}>
                        {stats.new}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                        New
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc', borderLeft: `4px solid #10b981` }}>
                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="text.primary" mb={0.5}>
                        {stats.resolved}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                        Resolved
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Card sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc', borderLeft: `4px solid #f59e0b` }}>
                    <CardContent sx={{ p: 2.5, textAlign: 'center' }}>
                      <Typography variant="h3" fontWeight={700} color="text.primary" mb={0.5}>
                        {stats.onHold}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                        On Hold
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Analytics Charts */}
            {submissions.length > 0 && (
              <Grid container spacing={3} mb={3}>
                {/* Submission Trend Chart */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Submission Trend
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last 7 days activity
                          </Typography>
                        </Box>
                        <TrendingUpIcon sx={{ color: '#1a73e8', fontSize: 28 }} />
                      </Box>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={trendData}>
                          <defs>
                            <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)} />
                          <XAxis
                            dataKey="date"
                            stroke={isDark ? alpha('#fff', 0.5) : alpha('#000', 0.5)}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis
                            stroke={isDark ? alpha('#fff', 0.5) : alpha('#000', 0.5)}
                            style={{ fontSize: '12px' }}
                            allowDecimals={false}
                          />
                          <RechartsTooltip
                            contentStyle={{
                              background: isDark ? '#1f2937' : 'white',
                              border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                              borderRadius: '8px',
                              padding: '12px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="submissions"
                            stroke="#1a73e8"
                            strokeWidth={3}
                            dot={{ fill: '#1a73e8', r: 5 }}
                            activeDot={{ r: 7, fill: '#4f46e5' }}
                            fill="url(#colorSubmissions)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Status Distribution Chart */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={700}>
                          Status Distribution
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current breakdown
                        </Typography>
                      </Box>
                      {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              contentStyle={{
                                background: isDark ? '#1f2937' : 'white',
                                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                                borderRadius: '8px',
                                padding: '12px',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                          <Typography variant="body2" color="text.secondary">
                            No data available
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </>
        )}

        {/* Submission Detail Modal */}
        <Dialog
          open={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            },
          }}
        >
          {selectedSubmission && (
            <>
              <DialogTitle
                sx={{
                  background: 'linear-gradient(135deg, #1a73e8 0%, #4f46e5 100%)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 3,
                }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Submission Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mt: 0.5 }}>
                    Form: {forms.find((f) => f.id === selectedForm)?.title || 'Unknown Form'}
                  </Typography>
                </Box>
                <IconButton onClick={() => setSelectedSubmission(null)} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent sx={{ pt: 3, pb: 0 }}>
                {/* Submission Info Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.1) 100%)',
                        borderColor: alpha('#1a73e8', 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #1a73e8 0%, #4f46e5 100%)',
                            boxShadow: `0 4px 12px ${alpha('#1a73e8', 0.3)}`,
                          }}
                        >
                          <CalendarIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#1a73e8', fontWeight: 600 }}>
                            SUBMITTED
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(selectedSubmission.createdAt).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                        borderColor: alpha('#10b981', 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: `0 4px 12px ${alpha('#10b981', 0.3)}`,
                          }}
                        >
                          <CheckCircleIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                            STATUS
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {selectedSubmission.status}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Current status
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
                        borderColor: alpha('#06b6d4', 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                            boxShadow: `0 4px 12px ${alpha('#06b6d4', 0.3)}`,
                          }}
                        >
                          <FingerprintIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 600 }}>
                            ID
                          </Typography>
                          <Typography variant="body2" fontWeight={700}>
                            {selectedSubmission.id.substring(0, 8)}...
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Unique identifier
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Submitter Information */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: isDark ? alpha('#fff', 0.02) : 'action.hover',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <PersonIcon sx={{ color: '#1a73e8' }} />
                    Submitter Information
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        IP Address
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          mt: 0.5,
                          bgcolor: isDark ? alpha('#000', 0.2) : 'white',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {selectedSubmission.ipAddress || 'Not available'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" fontWeight={600} color="text.secondary">
                        Browser/Device
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          mt: 0.5,
                          bgcolor: isDark ? alpha('#000', 0.2) : 'white',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2" noWrap title={selectedSubmission.userAgent}>
                          {selectedSubmission.userAgent || 'Not available'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Form Response Data */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: isDark ? alpha('#fff', 0.02) : 'white',
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <QuestionAnswerIcon sx={{ color: '#06b6d4' }} />
                    Responses
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  {Object.keys(
                    selectedSubmission.data.formData || selectedSubmission.data || {}
                  ).length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>
                      No data submitted
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.entries(
                        selectedSubmission.data.formData || selectedSubmission.data || {}
                      ).map(([fieldId, value], index) => {
                        const formattedValue = formatValue(value);
                        const fieldLabel = getFieldLabel(fieldId, index);
                        const fieldType = getFieldType(fieldId);

                        return (
                          <Box
                            key={fieldId}
                            sx={{
                              pb: 3,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none', pb: 0 },
                            }}
                          >
                            <Box sx={{ mb: 1.5 }}>
                              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                                <Typography
                                  component="span"
                                  sx={{
                                    color: '#1a73e8',
                                    fontWeight: 700,
                                    px: 1,
                                    py: 0.5,
                                    bgcolor: alpha('#1a73e8', 0.1),
                                    borderRadius: 1,
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  Q{index + 1}
                                </Typography>
                                <Typography
                                  variant="body1"
                                  fontWeight={600}
                                  sx={{ flex: 1 }}
                                >
                                  {fieldLabel}
                                </Typography>
                                {fieldType && (
                                  <Chip
                                    label={getFieldTypeLabel(fieldType)}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha('#06b6d4', 0.1),
                                      color: '#06b6d4',
                                      fontWeight: 600,
                                      fontSize: '0.75rem',
                                      height: 24,
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                bgcolor: isDark ? alpha('#1a73e8', 0.05) : alpha('#1a73e8', 0.03),
                                borderLeft: '4px solid',
                                borderLeftColor: '#1a73e8',
                                borderRadius: 2,
                              }}
                            >
                              <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                                {formattedValue}
                              </Typography>
                            </Paper>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </DialogContent>

              <DialogActions
                sx={{
                  bgcolor: isDark ? alpha('#fff', 0.02) : 'action.hover',
                  px: 3,
                  py: 2,
                  borderTop: `1px solid ${isDark ? alpha('#fff', 0.1) : 'divider'}`,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                  Total Responses:{' '}
                  <strong>
                    {
                      Object.keys(
                        selectedSubmission.data.formData || selectedSubmission.data || {}
                      ).length
                    }
                  </strong>
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setSelectedSubmission(null)}
                  sx={{
                    background: 'linear-gradient(135deg, #1a73e8 0%, #4f46e5 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                    },
                  }}
                >
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </UserLayout>
  );
};

export default Submissions;
