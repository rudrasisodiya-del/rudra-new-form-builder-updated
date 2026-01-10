import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Assignment as AssignmentIcon,
  BarChart as ChartIcon,
  ContentCopy as CopyIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const MyForms = () => {
  const theme = useTheme();
  const location = useLocation();
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [folderMenuAnchor, setFolderMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedFormForFolder, setSelectedFormForFolder] = useState<any>(null);
  const [currentFolder, setCurrentFolder] = useState<{ id: string; name: string } | null>(null);

  // Available folders
  const [folders] = useState([
    { id: 'home', name: 'Home' },
    { id: 'trash', name: 'Trash' },
  ]);

  useEffect(() => {
    fetchForms();
    // Check if we're navigating from a folder click
    const locationState = location.state as any;
    if (locationState?.folderId && locationState?.folderName) {
      setCurrentFolder({ id: locationState.folderId, name: locationState.folderName });
    }
  }, [location.state]);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      setForms(response.data.forms || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;

    try {
      await api.delete(`/forms/${id}`);
      setForms(forms.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, form: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handleShare = (form: any) => {
    const url = `${window.location.origin}/forms/${form.id}`;
    navigator.clipboard.writeText(url);
    alert('Form link copied to clipboard!');
    handleMenuClose();
  };

  const handleDuplicate = async (form: any) => {
    // Implement duplicate functionality
    console.log('Duplicate form:', form.id);
    handleMenuClose();
  };

  const handleMoveToFolder = async (formId: string, folderId: string) => {
    try {
      // Update form folder via API
      await api.patch(`/forms/${formId}`, { folder: folderId });
      // Update local state
      setForms(forms.map(f => f.id === formId ? { ...f, folder: folderId } : f));
      setFolderMenuAnchor(null);
      setSelectedFormForFolder(null);
    } catch (error) {
      console.error('Error moving form to folder:', error);
      alert('Failed to move form to folder');
    }
  };

  const handleFolderMenuClick = (event: React.MouseEvent<HTMLElement>, form: any) => {
    event.stopPropagation();
    setFolderMenuAnchor(event.currentTarget);
    setSelectedFormForFolder(form);
  };

  const handleFolderMenuClose = () => {
    setFolderMenuAnchor(null);
    setSelectedFormForFolder(null);
  };

  // Filter and search forms
  const filteredForms = useMemo(() => {
    return forms.filter(form => {
      const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || form.status === filterStatus;

      // Filter by folder if a folder is selected
      let matchesFolder = true;
      if (currentFolder) {
        if (currentFolder.id === 'home') {
          matchesFolder = !form.folder || form.folder === 'home';
        } else {
          matchesFolder = form.folder === currentFolder.id;
        }
      }

      return matchesSearch && matchesFilter && matchesFolder;
    });
  }, [forms, searchQuery, filterStatus, currentFolder]);

  // Gradient colors for cards
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  ];

  const getGradient = (index: number) => gradients[index % gradients.length];

  return (
    <UserLayout>
      <Box sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1400px',
        mx: 'auto',
      }}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
              }}
            >
              <DescriptionIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.5px',
                }}
              >
                My Forms
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                📋 Create, manage, and track your forms
              </Typography>
              {currentFolder && (
                <Chip
                  icon={<FolderOpenIcon sx={{ fontSize: 16 }} />}
                  label={`Folder: ${currentFolder.name}`}
                  onDelete={() => setCurrentFolder(null)}
                  size="small"
                  sx={{
                    mt: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/dashboard/forms/create"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.25,
              borderRadius: 2,
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Create Form
          </Button>
        </Stack>

        {/* Search and Filter Bar */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems="stretch"
            >
              <TextField
                fullWidth
                placeholder="Search forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    '&:hover': {
                      backgroundColor: theme.palette.background.default,
                    },
                    '&.Mui-focused': {
                      backgroundColor: theme.palette.background.default,
                    },
                  },
                }}
              />
              <Stack direction="row" spacing={1}>
                <Button
                  variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('all')}
                  startIcon={<FilterIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    whiteSpace: 'nowrap',
                    ...(filterStatus === 'all' && {
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    }),
                  }}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'PUBLISHED' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('PUBLISHED')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    whiteSpace: 'nowrap',
                    ...(filterStatus === 'PUBLISHED' && {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }),
                  }}
                >
                  Published
                </Button>
                <Button
                  variant={filterStatus === 'DRAFT' ? 'contained' : 'outlined'}
                  onClick={() => setFilterStatus('DRAFT')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 3,
                    whiteSpace: 'nowrap',
                    ...(filterStatus === 'DRAFT' && {
                      background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    }),
                  }}
                >
                  Draft
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
            <CircularProgress
              size={48}
              sx={{
                color: '#6366f1',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                }
              }}
            />
          </Box>
        ) : filteredForms.length === 0 ? (
          <Fade in={true}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ py: 12, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 4,
                    borderRadius: '50%',
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  }}
                >
                  <DescriptionIcon
                    sx={{
                      fontSize: 72,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  />
                </Box>
                <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                  {searchQuery || filterStatus !== 'all' ? 'No forms found' : 'No forms yet'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter to find what you\'re looking for'
                    : 'Create your first form to start collecting responses and insights'}
                </Typography>
                {!searchQuery && filterStatus === 'all' && (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    component={Link}
                    to="/dashboard/forms/create"
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Create Your First Form
                  </Button>
                )}
              </CardContent>
            </Card>
          </Fade>
        ) : (
          <Grid container spacing={3}>
            {filteredForms.map((form, index) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={form.id}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        '& .card-header-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                        },
                        '& .action-button': {
                          opacity: 1,
                        },
                      },
                    }}
                  >
                    {/* Card Header with Gradient */}
                    <Box
                      sx={{
                        height: 140,
                        background: getGradient(index),
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)',
                        },
                      }}
                    >
                      <FileIcon
                        className="card-header-icon"
                        sx={{
                          fontSize: 56,
                          color: 'white',
                          opacity: 0.95,
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                          transition: 'all 0.3s ease',
                          zIndex: 1,
                        }}
                      />
                      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                        <Chip
                          label={form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mb: 1.5,
                          fontSize: '1.125rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {form.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: 40,
                          lineHeight: 1.6,
                        }}
                      >
                        {form.description || 'No description provided'}
                      </Typography>

                      {/* Stats */}
                      <Stack
                        direction="row"
                        spacing={3}
                        sx={{
                          mb: 3,
                          pb: 3,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                      >
                        <Tooltip title="Submissions" arrow>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: alpha('#6366f1', 0.1),
                              }}
                            >
                              <AssignmentIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                                Submissions
                              </Typography>
                              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, mt: 0.5 }}>
                                {form.submissionCount || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Tooltip>
                        <Tooltip title="Views" arrow>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 1.5,
                                bgcolor: alpha('#06b6d4', 0.1),
                              }}
                            >
                              <ViewIcon sx={{ fontSize: 16, color: '#06b6d4' }} />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1 }}>
                                Views
                              </Typography>
                              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, mt: 0.5 }}>
                                {form.views || 0}
                              </Typography>
                            </Box>
                          </Stack>
                        </Tooltip>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Tooltip title="Edit Form" arrow>
                          <Button
                            variant="contained"
                            startIcon={<EditIcon fontSize="small" />}
                            component={Link}
                            to={`/dashboard/forms/builder/${form.id}`}
                            fullWidth
                            sx={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                              textTransform: 'none',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              py: 1,
                              borderRadius: 2,
                              boxShadow: 'none',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Tooltip>
                        <Tooltip title="Move to Folder" arrow>
                          <IconButton
                            onClick={(e) => handleFolderMenuClick(e, form)}
                            sx={{
                              border: `2px solid ${alpha('#f59e0b', 0.2)}`,
                              color: '#f59e0b',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: alpha('#f59e0b', 0.1),
                                borderColor: '#f59e0b',
                              },
                            }}
                          >
                            <FolderIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Responses" arrow>
                          <IconButton
                            component={Link}
                            to={`/dashboard/submissions/${form.id}`}
                            sx={{
                              border: `2px solid ${alpha('#06b6d4', 0.2)}`,
                              color: '#06b6d4',
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: alpha('#06b6d4', 0.1),
                                borderColor: '#06b6d4',
                              },
                            }}
                          >
                            <ChartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More Actions" arrow>
                          <IconButton
                            onClick={(e) => handleMenuClick(e, form)}
                            sx={{
                              border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                              borderRadius: 2,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <MoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <MenuItem
            onClick={() => selectedForm && handleShare(selectedForm)}
            sx={{ py: 1.5, gap: 2 }}
          >
            <ShareIcon fontSize="small" />
            <Typography>Share</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => selectedForm && handleDuplicate(selectedForm)}
            sx={{ py: 1.5, gap: 2 }}
          >
            <CopyIcon fontSize="small" />
            <Typography>Duplicate</Typography>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedForm) {
                handleDelete(selectedForm.id);
                handleMenuClose();
              }
            }}
            sx={{
              py: 1.5,
              gap: 2,
              color: 'error.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              }
            }}
          >
            <DeleteIcon fontSize="small" />
            <Typography>Delete</Typography>
          </MenuItem>
        </Menu>

        {/* Folder Selection Menu */}
        <Menu
          anchorEl={folderMenuAnchor}
          open={Boolean(folderMenuAnchor)}
          onClose={handleFolderMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              minWidth: 200,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Move to Folder
            </Typography>
          </Box>
          {folders.map((folder) => (
            <MenuItem
              key={folder.id}
              onClick={() => {
                if (selectedFormForFolder) {
                  handleMoveToFolder(selectedFormForFolder.id, folder.id);
                }
              }}
              sx={{
                py: 1.5,
                gap: 2,
                bgcolor: selectedFormForFolder?.folder === folder.id ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
              }}
            >
              <FolderIcon fontSize="small" sx={{ color: '#f59e0b' }} />
              <Typography>{folder.name}</Typography>
              {selectedFormForFolder?.folder === folder.id && (
                <CheckCircleIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />
              )}
            </MenuItem>
          ))}
        </Menu>

        {/* Stats Footer */}
        {filteredForms.length > 0 && (
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              justifyContent="space-around"
              divider={
                <Box sx={{
                  width: { xs: '100%', sm: 1 },
                  height: { xs: 1, sm: 40 },
                  bgcolor: alpha(theme.palette.divider, 0.1),
                }} />
              }
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {filteredForms.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Forms
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {filteredForms.reduce((acc, form) => acc + (form.submissionCount || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Submissions
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {filteredForms.reduce((acc, form) => acc + (form.views || 0), 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Views
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </UserLayout>
  );
};

export default MyForms;
