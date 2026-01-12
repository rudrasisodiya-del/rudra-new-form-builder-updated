import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  alpha,
  useTheme,
  Divider,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  InsertChart as ChartIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

// Modern SVG Line Chart Component
const LineChart = ({ data, color = '#1a73e8', height = 200 }: any) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d: any) => d.value), 1);
  const padding = 5;
  const width = 100;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = data
    .map((d: any, i: number) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + (chartHeight - (d.value / maxValue) * (chartHeight - 20));
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polyline
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        fill={`url(#gradient-${color})`}
        stroke="none"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d: any, i: number) => {
        const x = padding + (i / (data.length - 1)) * chartWidth;
        const y = padding + (chartHeight - (d.value / maxValue) * (chartHeight - 20));
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color} opacity="0.8">
            <animate attributeName="r" from="0" to="3" dur="0.5s" begin={`${i * 0.1}s`} />
          </circle>
        );
      })}
    </svg>
  );
};

// Modern SVG Bar Chart Component
const BarChart = ({ data, colors = ['#1a73e8', '#06b6d4', '#10b981', '#f59e0b'] }: any) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d: any) => d.value), 1);
  const barWidth = 80 / data.length;
  const spacing = 20 / (data.length + 1);

  return (
    <svg width="100%" height="200" viewBox="0 0 100 200" preserveAspectRatio="none">
      {data.map((d: any, i: number) => {
        const x = spacing + i * (barWidth + spacing);
        const height = (d.value / maxValue) * 160;
        const y = 180 - height;
        const color = colors[i % colors.length];

        return (
          <g key={i}>
            <defs>
              <linearGradient id={`bar-gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill={`url(#bar-gradient-${i})`}
              rx="2"
            >
              <animate attributeName="height" from="0" to={height} dur="0.8s" begin={`${i * 0.1}s`} />
              <animate attributeName="y" from="180" to={y} dur="0.8s" begin={`${i * 0.1}s`} />
            </rect>
          </g>
        );
      })}
    </svg>
  );
};

// Radial Progress Chart
const RadialProgress = ({ value, color, size = 120 }: any) => {
  const radius = 50;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <svg height={size} width={size}>
      <circle
        stroke={alpha(color, 0.1)}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference + ' ' + circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={size / 2}
        cy={size / 2}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      >
        <animate attributeName="stroke-dashoffset" from={circumference} to={strokeDashoffset} dur="1s" />
      </circle>
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="20"
        fontWeight="700"
        fill={color}
      >
        {value}%
      </text>
    </svg>
  );
};

// Clean Stat Card with Light Pastel Background - Pabbly Style
const AnimatedStatCard = ({
  title,
  value,
  icon,
  accentColor,
  percentage,
  trend = 'up',
  delay = 0,
}: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: accentColor,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                color: isDark ? alpha('#fff', 0.6) : '#64748b',
                fontWeight: 600,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: isDark ? '#fff' : '#1e293b',
                fontWeight: 700,
                fontSize: '1.875rem',
                lineHeight: 1.2,
                mb: 1.5,
              }}
            >
              {value}
            </Typography>
            {percentage !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {trend === 'up' ? (
                  <ArrowUpwardIcon sx={{ fontSize: 14, color: '#10b981' }} />
                ) : (
                  <ArrowDownwardIcon sx={{ fontSize: 14, color: '#ef4444' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? '#10b981' : '#ef4444',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  {percentage}% vs last period
                </Typography>
              </Stack>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              bgcolor: alpha(accentColor, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, {
              sx: {
                fontSize: 26,
                color: accentColor,
              }
            })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      fetchAnalytics();
    }
  }, [selectedForm]);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      const formsList = response.data.forms || [];
      setForms(formsList);
      if (formsList.length > 0) {
        setSelectedForm(formsList[0]);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!selectedForm) return;

    try {
      const submissionsRes = await api.get(`/submissions/form/${selectedForm.id}`);
      setSubmissions(submissionsRes.data.submissions || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const totalViews = selectedForm?.views || 0;
  const totalSubmissions = submissions.length;
  const conversionRate = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : 0;

  // Status breakdown
  const statusBreakdown = {
    new: submissions.filter((s) => s.status === 'NEW').length,
    resolved: submissions.filter((s) => s.status === 'RESOLVED').length,
    onHold: submissions.filter((s) => s.status === 'ON_HOLD').length,
    partial: submissions.filter((s) => s.status === 'PARTIAL').length,
  };

  // Submissions over time (last 7 days)
  const getLast7DaysData = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const daySubmissions = submissions.filter((s) => {
        const submissionDate = new Date(s.createdAt);
        return submissionDate.toDateString() === date.toDateString();
      });
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        value: daySubmissions.length,
      });
    }
    return days;
  };

  const submissionsOverTime = getLast7DaysData();

  // Average fields per submission
  const avgFields =
    submissions.length > 0
      ? (
          submissions.reduce((acc, s) => acc + Object.keys(s.data || {}).length, 0) / submissions.length
        ).toFixed(1)
      : 0;

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#1a73e8' }} />
        </Box>
      </UserLayout>
    );
  }

  if (forms.length === 0) {
    return (
      <UserLayout>
        <Card
          sx={{
            textAlign: 'center',
            py: 12,
            m: 3,
            background: isDark
              ? 'linear-gradient(135deg, rgba(26, 115, 232, 0.05) 0%, rgba(66, 133, 244, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(26, 115, 232, 0.03) 0%, rgba(66, 133, 244, 0.03) 100%)',
            border: `2px dashed ${isDark ? alpha('#1a73e8', 0.3) : alpha('#1a73e8', 0.2)}`,
          }}
        >
          <CardContent>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 3,
                boxShadow: `0 8px 24px ${alpha('#1a73e8', 0.3)}`,
              }}
            >
              <ChartIcon sx={{ fontSize: 50, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              No forms found
            </Typography>
            <Typography color="text.secondary">Create a form to see analytics and insights</Typography>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  if (!selectedForm) {
    return (
      <UserLayout>
        <Box sx={{ p: 3, textAlign: 'center', py: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Select a form to view analytics
          </Typography>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
        {/* Actions Bar */}
        {forms.length > 1 && (
          <Stack direction="row" justifyContent="flex-end" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={fetchAnalytics}
                sx={{
                  background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  '&:hover': {
                    background: '#1a73e8',
                    color: 'white',
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <InputLabel>Select Form</InputLabel>
              <Select
                value={selectedForm.id}
                label="Select Form"
                onChange={(e) => {
                  const form = forms.find((f) => f.id === e.target.value);
                  setSelectedForm(form);
                  setLoading(true);
                }}
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
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
                    {form.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnimatedStatCard
              title="TOTAL VIEWS"
              value={totalViews.toLocaleString()}
              icon={<ViewIcon />}
              accentColor="#1a73e8"
              percentage={12}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnimatedStatCard
              title="SUBMISSIONS"
              value={totalSubmissions.toLocaleString()}
              icon={<DescriptionIcon />}
              accentColor="#06b6d4"
              percentage={8}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnimatedStatCard
              title="CONVERSION RATE"
              value={`${conversionRate}%`}
              icon={<TrendingUpIcon />}
              accentColor="#10b981"
              percentage={5}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <AnimatedStatCard
              title="AVG FIELDS/SUBMISSION"
              value={avgFields}
              icon={<ChartIcon />}
              accentColor="#f59e0b"
              percentage={3}
              trend="down"
            />
          </Grid>
        </Grid>

        {/* Charts Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Submissions Over Time Chart */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                height: '100%',
                background: isDark ? alpha('#fff', 0.02) : 'white',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: '#1a73e8',
                        }}
                      >
                        <ShowChartIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight={700}>
                        Submissions Over Time
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 6.5 }}>
                      Last 7 days activity
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CalendarIcon sx={{ fontSize: 16 }} />}
                    label="7 Days"
                    size="small"
                    sx={{
                      background: alpha('#1a73e8', 0.1),
                      color: '#1a73e8',
                      fontWeight: 600,
                      border: `1px solid ${alpha('#1a73e8', 0.2)}`,
                    }}
                  />
                </Stack>

                <Box sx={{ mb: 2 }}>
                  <LineChart data={submissionsOverTime} color="#1a73e8" height={200} />
                </Box>

                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                  {submissionsOverTime.map((day, i) => (
                    <Box key={i} sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {day.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {day.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Conversion Rate Visualization */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                height: '100%',
                background: isDark ? alpha('#fff', 0.02) : 'white',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                  >
                    <PieChartIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Conversion
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Views to submissions
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <RadialProgress value={parseFloat(conversionRate.toString())} color="#10b981" size={140} />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        bgcolor: isDark ? alpha('#1a73e8', 0.05) : alpha('#1a73e8', 0.03),
                        borderColor: alpha('#1a73e8', 0.2),
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} color="#1a73e8">
                        {totalViews}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        VIEWS
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        textAlign: 'center',
                        bgcolor: isDark ? alpha('#10b981', 0.05) : alpha('#10b981', 0.03),
                        borderColor: alpha('#10b981', 0.2),
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} color="#10b981">
                        {totalSubmissions}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        SUBMITTED
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Breakdown & Recent Activity */}
        <Grid container spacing={3}>
          {/* Status Breakdown */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              sx={{
                background: isDark ? alpha('#fff', 0.02) : 'white',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #1a73e8 0%, #7c3aed 100%)',
                    }}
                  >
                    <BarChartIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Status Breakdown
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distribution by status
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ mb: 3 }}>
                  <BarChart
                    data={[
                      { label: 'New', value: statusBreakdown.new },
                      { label: 'Resolved', value: statusBreakdown.resolved },
                      { label: 'On Hold', value: statusBreakdown.onHold },
                      { label: 'Partial', value: statusBreakdown.partial },
                    ]}
                    colors={['#3b82f6', '#10b981', '#f59e0b', '#1a73e8']}
                  />
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                        <Typography variant="body2" fontWeight={600}>
                          New
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} color="#3b82f6">
                        {statusBreakdown.new}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(statusBreakdown.new / totalSubmissions) * 100 || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha('#3b82f6', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: '#3b82f6', borderRadius: 3 },
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981' }} />
                        <Typography variant="body2" fontWeight={600}>
                          Resolved
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} color="#10b981">
                        {statusBreakdown.resolved}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(statusBreakdown.resolved / totalSubmissions) * 100 || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha('#10b981', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 3 },
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                        <Typography variant="body2" fontWeight={600}>
                          On Hold
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} color="#f59e0b">
                        {statusBreakdown.onHold}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(statusBreakdown.onHold / totalSubmissions) * 100 || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha('#f59e0b', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: '#f59e0b', borderRadius: 3 },
                      }}
                    />
                  </Box>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1a73e8' }} />
                        <Typography variant="body2" fontWeight={600}>
                          Partial
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} color="#1a73e8">
                        {statusBreakdown.partial}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(statusBreakdown.partial / totalSubmissions) * 100 || 0}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha('#1a73e8', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: '#1a73e8', borderRadius: 3 },
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              sx={{
                background: isDark ? alpha('#fff', 0.02) : 'white',
                border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    }}
                  >
                    <ScheduleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Recent Submissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest activity from your form
                    </Typography>
                  </Box>
                </Stack>

                {submissions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No submissions yet
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {submissions.slice(0, 5).map((submission, index) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'NEW':
                            return { color: '#3b82f6', bg: alpha('#3b82f6', 0.1) };
                          case 'RESOLVED':
                            return { color: '#10b981', bg: alpha('#10b981', 0.1) };
                          case 'ON_HOLD':
                            return { color: '#f59e0b', bg: alpha('#f59e0b', 0.1) };
                          case 'PARTIAL':
                            return { color: '#1a73e8', bg: alpha('#1a73e8', 0.1) };
                          default:
                            return { color: '#6b7280', bg: alpha('#6b7280', 0.1) };
                        }
                      };

                      const statusConfig = getStatusColor(submission.status);

                      return (
                        <Paper
                          key={submission.id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.3s',
                            animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                            '&:hover': {
                              bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                              transform: 'translateX(8px)',
                            },
                            '@keyframes slideIn': {
                              from: { opacity: 0, transform: 'translateX(-20px)' },
                              to: { opacity: 1, transform: 'translateX(0)' },
                            },
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: statusConfig.bg,
                                color: statusConfig.color,
                              }}
                            >
                              <DescriptionIcon fontSize="small" />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                Submission #{submission.id.substring(0, 8)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(submission.createdAt).toLocaleString()}
                              </Typography>
                            </Box>
                          </Stack>
                          <Chip
                            label={submission.status}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.bg,
                              color: statusConfig.color,
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
                            }}
                          />
                        </Paper>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </UserLayout>
  );
};

export default Analytics;
