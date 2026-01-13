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
  Search as SearchIcon,
  FilterList as FilterIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Assignment as AssignmentIcon,
  BarChart as ChartIcon,
  ContentCopy as CopyIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  CheckCircle as CheckCircleIcon,
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

  const isDark = theme.palette.mode === 'dark';

  return (
    <UserLayout>
      <Box sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1400px',
        mx: 'auto',
      }}>
        {/* Folder indicator */}
        {currentFolder && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={<FolderOpenIcon sx={{ fontSize: 16 }} />}
              label={`Folder: ${currentFolder.name}`}
              onDelete={() => setCurrentFolder(null)}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          </Box>
        )}

        {/* Toolbar - Search, Filters, and Create Button */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 4,
            p: 2,
            borderRadius: 3,
            bgcolor: isDark ? alpha('#1e293b', 0.5) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          }}
        >
          {/* Search Input */}
          <TextField
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: '100%', md: 280 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: isDark ? alpha('#0f172a', 0.6) : '#ffffff',
                '& fieldset': {
                  borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                },
              },
            }}
          />

          {/* Filter Chips */}
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {[
              { key: 'all', label: 'All', color: '#1a73e8' },
              { key: 'PUBLISHED', label: 'Published', color: '#10b981' },
              { key: 'DRAFT', label: 'Draft', color: '#f59e0b' },
            ].map((filter) => (
              <Chip
                key={filter.key}
                label={filter.label}
                onClick={() => setFilterStatus(filter.key)}
                variant={filterStatus === filter.key ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  height: 32,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ...(filterStatus === filter.key ? {
                    bgcolor: filter.color,
                    color: '#fff',
                    borderColor: filter.color,
                    '&:hover': {
                      bgcolor: filter.color,
                      opacity: 0.9,
                    },
                  } : {
                    bgcolor: 'transparent',
                    color: isDark ? alpha('#fff', 0.7) : '#64748b',
                    borderColor: isDark ? alpha('#fff', 0.15) : '#e2e8f0',
                    '&:hover': {
                      bgcolor: alpha(filter.color, 0.08),
                      borderColor: filter.color,
                      color: filter.color,
                    },
                  }),
                }}
              />
            ))}
          </Stack>

          {/* Spacer */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />

          {/* Create Form Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/dashboard/forms/create"
            sx={{
              background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(26, 115, 232, 0.3)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #1557b0 0%, #0d47a1 100%)',
                boxShadow: '0 4px 12px rgba(26, 115, 232, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Create Form
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
            <CircularProgress
              size={48}
              sx={{
                color: '#1a73e8',
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
                borderRadius: 3,
                boxShadow: 'none',
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ py: 12, textAlign: 'center' }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    p: 3,
                    borderRadius: '50%',
                    mb: 3,
                    background: alpha('#1a73e8', 0.1),
                  }}
                >
                  <DescriptionIcon
                    sx={{
                      fontSize: 64,
                      color: '#1a73e8',
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
                      background: '#1a73e8',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(26, 115, 232, 0.25)',
                      '&:hover': {
                        background: '#1557b0',
                        boxShadow: '0 4px 12px rgba(26, 115, 232, 0.35)',
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
                      background: isDark ? alpha('#1e293b', 0.8) : '#ffffff',
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                      boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.1)',
                        borderColor: '#1a73e8',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header with Icon and Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: form.status === 'PUBLISHED' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <DescriptionIcon
                            sx={{
                              fontSize: 24,
                              color: form.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                            }}
                          />
                        </Box>
                        <Chip
                          label={form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          size="small"
                          sx={{
                            bgcolor: form.status === 'PUBLISHED' ? alpha('#10b981', 0.1) : alpha('#f59e0b', 0.1),
                            color: form.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 24,
                          }}
                        />
                      </Stack>

                      {/* Title and Description */}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          fontSize: '1rem',
                          color: isDark ? '#fff' : '#1e293b',
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
                        sx={{
                          mb: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          color: isDark ? alpha('#fff', 0.6) : '#64748b',
                          fontSize: '0.875rem',
                        }}
                      >
                        {form.description || 'No description provided'}
                      </Typography>

                      {/* Stats Row */}
                      <Stack
                        direction="row"
                        spacing={4}
                        sx={{
                          mb: 3,
                          pb: 3,
                          borderBottom: '1px solid',
                          borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <AssignmentIcon sx={{ fontSize: 18, color: isDark ? alpha('#fff', 0.5) : '#94a3b8' }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDark ? alpha('#fff', 0.5) : '#94a3b8',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Submissions
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: isDark ? '#fff' : '#1e293b' }}
                            >
                              {form.submissionCount || 0}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ViewIcon sx={{ fontSize: 18, color: isDark ? alpha('#fff', 0.5) : '#94a3b8' }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: isDark ? alpha('#fff', 0.5) : '#94a3b8',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Views
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{ color: isDark ? '#fff' : '#1e293b' }}
                            >
                              {form.views || 0}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>

                      {/* Actions */}
                      <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon sx={{ fontSize: 18 }} />}
                          component={Link}
                          to={`/dashboard/forms/builder/${form.id}`}
                          sx={{
                            flex: 1,
                            bgcolor: '#1a73e8',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            py: 1,
                            borderRadius: 2,
                            boxShadow: 'none',
                            '&:hover': {
                              bgcolor: '#1557b0',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          Edit
                        </Button>
                        <IconButton
                          onClick={(e) => handleFolderMenuClick(e, form)}
                          sx={{
                            border: '1px solid',
                            borderColor: isDark ? alpha('#fff', 0.2) : '#e2e8f0',
                            color: '#f59e0b',
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha('#f59e0b', 0.1),
                              borderColor: '#f59e0b',
                            },
                          }}
                        >
                          <FolderIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/dashboard/submissions/${form.id}`}
                          sx={{
                            border: '1px solid',
                            borderColor: isDark ? alpha('#fff', 0.2) : '#e2e8f0',
                            color: '#1a73e8',
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: alpha('#1a73e8', 0.1),
                              borderColor: '#1a73e8',
                            },
                          }}
                        >
                          <ChartIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, form)}
                          sx={{
                            border: '1px solid',
                            borderColor: isDark ? alpha('#fff', 0.2) : '#e2e8f0',
                            color: isDark ? alpha('#fff', 0.7) : '#64748b',
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.04),
                              borderColor: isDark ? alpha('#fff', 0.3) : '#cbd5e1',
                            },
                          }}
                        >
                          <MoreIcon sx={{ fontSize: 20 }} />
                        </IconButton>
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
      </Box>
    </UserLayout>
  );
};

export default MyForms;
