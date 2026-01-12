import React, { useEffect, useState } from 'react';
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

// Modern Stat Card Component - Clean Professional Style
const AnimatedStatCard = ({
  title,
  value,
  icon,
  accentColor,
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
        background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
        borderRadius: 3,
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
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
                  {percentage}% vs last month
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

    const colors = ['#3b82f6', '#10b981', '#1a73e8', '#f59e0b', '#ec4899', '#06b6d4'];
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
        {/* Header - Pabbly Style */}
        <Box
          sx={{
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.6)
              : '#ffffff',
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
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
                  width: 64,
                  height: 64,
                  borderRadius: '16px',
                  background: '#1a73e8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(26, 115, 232, 0.25)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <RocketIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  fontWeight={700}
                  sx={{
                    mb: 1,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    color: theme.palette.text.primary,
                    letterSpacing: '-0.5px',
                  }}
                >
                  Welcome back, {user?.name || 'User'}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={400}
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
                startIcon={<AddIcon sx={{ fontSize: 20 }} />}
                component={Link}
                to="/dashboard/forms/create"
                sx={{
                  background: '#1a73e8',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(26, 115, 232, 0.25)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#1557b0',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(26, 115, 232, 0.35)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                Create New Form
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Total Forms"
              value={stats.forms}
              icon={<DescriptionIcon />}
              accentColor="#f59e0b"
              percentage={12.5}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Submissions"
              value={stats.submissions}
              icon={<CheckCircleIcon />}
              accentColor="#1a73e8"
              percentage={8.2}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Total Views"
              value={stats.views}
              icon={<VisibilityIcon />}
              accentColor="#06b6d4"
              percentage={15.3}
              trend="up"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnimatedStatCard
              title="Conversion Rate"
              value={stats.forms > 0 ? `${Math.round((stats.submissions / (stats.views || 1)) * 100)}%` : '0%'}
              icon={<AutoGraphIcon />}
              accentColor="#10b981"
              percentage={3.1}
              trend="up"
            />
          </Grid>
        </Grid>

        {/* Progress Card */}
        <Box sx={{ mb: 4 }}>
          <ProgressCard
            title="Form Usage"
            current={formsUsed}
            total={FREE_FORMS_LIMIT}
            color="#1a73e8"
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
                        bgcolor: alpha('#1a73e8', 0.1),
                        color: '#1a73e8',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label={`Active ${stats.forms}`}
                      variant="outlined"
                      sx={{
                        borderColor: alpha('#1a73e8', 0.3),
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
                        boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
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
                      <TableRow sx={{ bgcolor: alpha('#1a73e8', 0.05) }}>
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
                                  bgcolor: alpha('#1a73e8', 0.1),
                                }}
                              >
                                <DescriptionIcon sx={{ fontSize: 40, color: '#1a73e8' }} />
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
                                  background: '#1a73e8',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  color: 'white',
                                  '&:hover': {
                                    background: '#1557b0',
                                  },
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
                                bgcolor: alpha('#1a73e8', 0.02),
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
                                  bgcolor: alpha('#1a73e8', 0.1),
                                  color: '#1a73e8',
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  px: 2.5,
                                  '&:hover': {
                                    bgcolor: alpha('#1a73e8', 0.2),
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
                        bgcolor: alpha('#1a73e8', 0.1),
                        color: '#1a73e8',
                        '&:hover': {
                          bgcolor: alpha('#1a73e8', 0.2),
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
                            bgcolor: alpha('#1a73e8', 0.05),
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
                            bgcolor: alpha('#1a73e8', 0.1),
                            color: '#1a73e8',
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>

              {/* Upgrade Card - Pabbly Style */}
              <Card
                sx={{
                  background: '#1a73e8',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(26, 115, 232, 0.3)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <RocketIcon sx={{ color: 'white', fontSize: 24 }} />
                    <Typography variant="h6" color="white" fontWeight={700}>
                      Upgrade to Pro
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, lineHeight: 1.6 }}>
                    Unlock unlimited forms, advanced analytics, custom branding, and priority support
                  </Typography>
                  <Button
                    component={Link}
                    to="/pricing"
                    variant="contained"
                    fullWidth
                    size="medium"
                    sx={{
                      bgcolor: 'white',
                      color: '#1a73e8',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.25,
                      borderRadius: 2,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.95)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
                background: 'linear-gradient(135deg, #1a73e8 0%, #1a73e8 100%)',
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
