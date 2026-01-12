import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Chip,
  Paper,
  IconButton,
  Stack,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  AutoGraph as AutoGraphIcon,
  Rocket as RocketIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

// Modern Animated Stat Card Component
const AnimatedStatCard = ({
  title,
  value,
  icon,
  gradient,
  percentage,
  trend = 'up',
  delay = 0
}: any) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: gradient,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: `slideUp 0.6s ease-out ${delay}s both`,
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(99, 102, 241, 0.3)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)',
          opacity: 0,
          transition: 'opacity 0.3s',
        },
        '&:hover::before': {
          opacity: 1,
        },
        '@keyframes slideUp': {
          from: {
            opacity: 0,
            transform: 'translateY(30px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 600,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              {value}
            </Typography>
            {percentage !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {trend === 'up' ? (
                  <ArrowUpwardIcon sx={{ fontSize: 16, color: '#4ade80' }} />
                ) : (
                  <ArrowDownwardIcon sx={{ fontSize: 16, color: '#f87171' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: trend === 'up' ? '#4ade80' : '#f87171',
                    fontWeight: 700,
                  }}
                >
                  {percentage}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  vs last month
                </Typography>
              </Stack>
            )}
          </Box>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
};

// Progress Card Component
const ProgressCard = ({ title, current, total, color }: any) => {
  const percentage = Math.round((current / total) * 100);
  const theme = useTheme();

  return (
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          <Chip
            label={`${current}/${total}`}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 700,
            }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(color, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: color,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
            },
          }}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {percentage}% used
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ color: color }}>
            {total - current} remaining
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ forms: 0, submissions: 0, views: 0 });
  const [forms, setForms] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([
    { id: 'home', name: 'Home', icon: 'folder', color: '#f59e0b', count: 0 },
    { id: 'trash', name: 'Trash', icon: 'delete', color: '#ef4444', count: 0 }
  ]);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const theme = useTheme();

  const FREE_FORMS_LIMIT = 10;
  const formsUsed = stats.forms;
  const formsRemaining = FREE_FORMS_LIMIT - formsUsed;

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: newFolderName.trim(),
      icon: 'folder',
      color: randomColor,
      count: 0
    };

    setFolders(prev => [...prev.slice(0, -1), newFolder, prev[prev.length - 1]]);
    setNewFolderName('');
    setFolderDialogOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes.data.user);

        const formsRes = await api.get('/forms');
        const forms = formsRes.data.forms || [];
        setForms(forms);

        // Update folder counts
        const homeCount = forms.filter((f: any) => !f.folder || f.folder === 'home').length;
        const trashCount = forms.filter((f: any) => f.folder === 'trash').length;

        setFolders(prevFolders => prevFolders.map(folder => {
          if (folder.id === 'home') return { ...folder, count: homeCount };
          if (folder.id === 'trash') return { ...folder, count: trashCount };
          return folder;
        }));

        setStats({
          forms: forms.length,
          submissions: forms.reduce((acc: number, f: any) => acc + (f.submissionCount || 0), 0),
          views: forms.reduce((acc: number, f: any) => acc + (f.views || 0), 0),
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header with gradient background */}
        <Box
          sx={{
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0, 0, 0, 0.4)'
              : '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -150,
              right: -150,
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#6366f1', theme.palette.mode === 'dark' ? 0.15 : 0.08)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -100,
              left: -100,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#8b5cf6', theme.palette.mode === 'dark' ? 0.1 : 0.05)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            <Stack direction="row" alignItems="center" spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 12px 32px rgba(99, 102, 241, 0.35)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(5deg)',
                  },
                }}
              >
                <RocketIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{
                    mb: 1,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-1.5px',
                  }}
                >
                  Welcome back, {user?.name || 'User'}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                  sx={{
                    maxWidth: 600,
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                  }}
                >
                  Track your forms performance and create amazing forms with our intuitive builder
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon sx={{ fontSize: 24 }} />}
                component={Link}
                to="/dashboard/forms/create"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  px: 5,
                  py: 2,
                  borderRadius: 3,
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 28px rgba(99, 102, 241, 0.45)',
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Create New Form
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Animated Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Total Forms"
              value={stats.forms}
              icon={<DescriptionIcon sx={{ fontSize: 32, color: 'white' }} />}
              gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
              percentage={12.5}
              trend="up"
              delay={0}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Submissions"
              value={stats.submissions}
              icon={<CheckCircleIcon sx={{ fontSize: 32, color: 'white' }} />}
              gradient="linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
              percentage={8.2}
              trend="up"
              delay={0.1}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Total Views"
              value={stats.views}
              icon={<VisibilityIcon sx={{ fontSize: 32, color: 'white' }} />}
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
              percentage={15.3}
              trend="up"
              delay={0.2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Conversion Rate"
              value={stats.forms > 0 ? `${Math.round((stats.submissions / (stats.views || 1)) * 100)}%` : '0%'}
              icon={<AutoGraphIcon sx={{ fontSize: 32, color: 'white' }} />}
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              percentage={3.1}
              trend="up"
              delay={0.3}
            />
          </Grid>
        </Grid>

        {/* Progress Card */}
        <Box sx={{ mb: 4 }}>
          <ProgressCard
            title="Form Usage"
            current={formsUsed}
            total={FREE_FORMS_LIMIT}
            color="#6366f1"
          />
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Forms List */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
                      Your Forms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Manage and track all your forms
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`All ${stats.forms}`}
                      sx={{
                        bgcolor: alpha('#6366f1', 0.1),
                        color: '#6366f1',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label={`Active ${stats.forms}`}
                      variant="outlined"
                      sx={{
                        borderColor: alpha('#6366f1', 0.3),
                        color: 'text.secondary',
                      }}
                    />
                  </Stack>
                </Stack>

                <TextField
                  fullWidth
                  placeholder="Search forms by name..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: `0 0 0 2px ${alpha('#6366f1', 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha('#6366f1', 0.2)}`,
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

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
                      <TableRow sx={{ bgcolor: alpha('#6366f1', 0.05) }}>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Form Name</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Submissions</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Views</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: 'text.primary' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.forms === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="center"
                            sx={{
                              py: 8,
                              bgcolor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 80,
                                  height: 80,
                                  bgcolor: alpha('#6366f1', 0.1),
                                }}
                              >
                                <DescriptionIcon sx={{ fontSize: 40, color: '#6366f1' }} />
                              </Avatar>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography
                                  variant="h6"
                                  fontWeight={700}
                                  gutterBottom
                                  sx={{ color: theme.palette.text.primary }}
                                >
                                  No forms yet
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 2,
                                    color: theme.palette.text.secondary
                                  }}
                                >
                                  Create your first form to start collecting responses
                                </Typography>
                              </Box>
                              <Button
                                component={Link}
                                to="/dashboard/forms/create"
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{
                                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  color: 'white',
                                }}
                              >
                                Create Your First Form
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        forms.slice(0, 5).map((form: any) => (
                          <TableRow
                            key={form.id}
                            hover
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: alpha('#6366f1', 0.02),
                              },
                            }}
                          >
                            <TableCell>
                              <Chip
                                label={form.status === 'PUBLISHED' ? 'Active' : 'Draft'}
                                size="small"
                                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                sx={{
                                  bgcolor: form.status === 'PUBLISHED' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                                  color: form.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                                  fontWeight: 700,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {form.title || 'Untitled Form'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Created {new Date(form.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {form.submissionCount || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {form.views || 0}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                component={Link}
                                to={`/dashboard/forms/builder/${form.id}`}
                                size="small"
                                variant="contained"
                                sx={{
                                  bgcolor: alpha('#6366f1', 0.1),
                                  color: '#6366f1',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  px: 2.5,
                                  '&:hover': {
                                    bgcolor: alpha('#6366f1', 0.2),
                                  },
                                }}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* Folders Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Folders
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setFolderDialogOpen(true)}
                      sx={{
                        bgcolor: alpha('#6366f1', 0.1),
                        color: '#6366f1',
                        '&:hover': {
                          bgcolor: alpha('#6366f1', 0.2),
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Stack>
                  <Stack spacing={1}>
                    {folders.map((folder) => (
                      <Box
                        key={folder.id}
                        onClick={() => navigate('/dashboard/forms', { state: { folderId: folder.id, folderName: folder.name } })}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            bgcolor: alpha('#6366f1', 0.05),
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: alpha(folder.color, 0.1),
                            }}
                          >
                            {folder.icon === 'folder' ? (
                              <FolderIcon sx={{ color: folder.color, fontSize: 20 }} />
                            ) : (
                              <DeleteIcon sx={{ color: folder.color, fontSize: 20 }} />
                            )}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {folder.name}
                          </Typography>
                        </Stack>
                        <Chip
                          label={folder.count}
                          size="small"
                          sx={{
                            bgcolor: alpha('#6366f1', 0.1),
                            color: '#6366f1',
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Upgrade Card */}
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
                    <RocketIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Typography variant="h5" color="white" fontWeight={800}>
                      Upgrade to Pro
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', mb: 3, lineHeight: 1.6 }}>
                    Unlock unlimited forms, advanced analytics, custom branding, and priority support to supercharge your workflow
                  </Typography>
                  <Button
                    component={Link}
                    to="/pricing"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      bgcolor: 'white',
                      color: '#6366f1',
                      fontWeight: 800,
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
                    View Plans
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        {/* Create Folder Dialog */}
        <Dialog
          open={folderDialogOpen}
          onClose={() => setFolderDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
            Create New Folder
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Folder Name"
              type="text"
              fullWidth
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
              placeholder="Enter folder name..."
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={() => {
                setFolderDialogOpen(false);
                setNewFolderName('');
              }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              variant="contained"
              disabled={!newFolderName.trim()}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                },
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </UserLayout>
  );
};

export default Dashboard;
