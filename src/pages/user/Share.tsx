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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Link as LinkIcon,
  ContentCopy as CopyIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  Code as CodeIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const Share = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState('');
  const theme = useTheme();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      const formsList = response.data.forms || [];
      setForms(formsList);
      if (formsList.length > 0) {
        setSelectedForm(formsList[0]);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const formUrl = selectedForm ? `${window.location.origin}/forms/${selectedForm.id}` : '';
  const embedCode = selectedForm ? `<iframe src="${formUrl}" width="100%" height="600" frameborder="0"></iframe>` : '';

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setCopied(true);
  };

  const handleCloseSnackbar = () => {
    setCopied(false);
  };

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <Typography color="text.secondary">Loading...</Typography>
        </Box>
      </UserLayout>
    );
  }

  if (forms.length === 0) {
    return (
      <UserLayout>
        <Box sx={{ p: { xs: 2, md: 4 } }}>
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
              <ShareIcon sx={{ fontSize: 60, color: 'white' }} />
            </Avatar>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              No forms found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a form first to share it with others
            </Typography>
          </Card>
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1600px', mx: 'auto' }}>
        {/* Header with Share Icon */}
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
            }}
          >
            <ShareIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mb: 0.5,
                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              Share
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              📤 Share your form with the world
            </Typography>
          </Box>
          {forms.length > 1 && (
            <FormControl sx={{ minWidth: 280 }}>
              <Select
                value={selectedForm?.id || ''}
                onChange={(e) => {
                  const form = forms.find(f => f.id === e.target.value);
                  setSelectedForm(form);
                }}
                size="small"
                sx={{
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#8b5cf6', 0.2),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
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
          )}
        </Stack>

        {/* Warning for unpublished form */}
        {selectedForm?.status !== 'PUBLISHED' && (
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              borderRadius: 2,
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            This form is not published yet. Publish it first to share with others.
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>
              {/* Direct Link Card */}
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
                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <LinkIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Direct Link
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Share this link to allow others to fill your form
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#6366f1', 0.05),
                      border: `1px solid ${alpha('#6366f1', 0.1)}`,
                    }}
                  >
                    <TextField
                      fullWidth
                      value={formUrl}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <LanguageIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                        sx: {
                          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                          bgcolor: 'background.paper',
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<CopyIcon />}
                      onClick={() => copyToClipboard(formUrl, 'link')}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${alpha('#6366f1', 0.3)}`,
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha('#6366f1', 0.4)}`,
                        },
                      }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Embed Code Card */}
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
                        Embed Code
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Copy this code and paste it into your website's HTML
                      </Typography>
                    </Box>
                  </Stack>

                  <Paper
                    sx={{
                      bgcolor: '#1e293b',
                      p: 3,
                      borderRadius: 2,
                      mb: 2,
                      position: 'relative',
                      overflow: 'auto',
                    }}
                  >
                    <code
                      style={{
                        color: '#e2e8f0',
                        fontFamily: 'Monaco, monospace',
                        fontSize: '0.875rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                      }}
                    >
                      {embedCode}
                    </code>
                  </Paper>

                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={() => copyToClipboard(embedCode, 'embed')}
                    sx={{
                      borderColor: '#06b6d4',
                      color: '#06b6d4',
                      textTransform: 'none',
                      fontWeight: 700,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: '#0891b2',
                        bgcolor: alpha('#06b6d4', 0.05),
                      },
                    }}
                  >
                    Copy Embed Code
                  </Button>
                </CardContent>
              </Card>

              {/* Social Media Share Card */}
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
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        width: 56,
                        height: 56,
                      }}
                    >
                      <ShareIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        Share on Social Media
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Share your form across social platforms
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Button
                        component="a"
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(formUrl)}&text=${encodeURIComponent('Fill out this form: ' + selectedForm.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: '#1DA1F2',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#1a8cd8',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha('#1DA1F2', 0.3)}`,
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        <Stack spacing={1} alignItems="center">
                          <TwitterIcon />
                          <Typography variant="caption" fontWeight={600}>
                            Twitter
                          </Typography>
                        </Stack>
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Button
                        component="a"
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(formUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: '#1877F2',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#1565d8',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha('#1877F2', 0.3)}`,
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        <Stack spacing={1} alignItems="center">
                          <FacebookIcon />
                          <Typography variant="caption" fontWeight={600}>
                            Facebook
                          </Typography>
                        </Stack>
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Button
                        component="a"
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: '#0A66C2',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#0952a5',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha('#0A66C2', 0.3)}`,
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        <Stack spacing={1} alignItems="center">
                          <LinkedInIcon />
                          <Typography variant="caption" fontWeight={600}>
                            LinkedIn
                          </Typography>
                        </Stack>
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Button
                        component="a"
                        href={`mailto:?subject=${encodeURIComponent(selectedForm.title)}&body=${encodeURIComponent('Fill out this form: ' + formUrl)}`}
                        fullWidth
                        variant="contained"
                        sx={{
                          bgcolor: '#6b7280',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 2,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: '#4b5563',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 16px ${alpha('#6b7280', 0.3)}`,
                          },
                          transition: 'all 0.3s',
                        }}
                      >
                        <Stack spacing={1} alignItems="center">
                          <EmailIcon />
                          <Typography variant="caption" fontWeight={600}>
                            Email
                          </Typography>
                        </Stack>
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>
              {/* QR Code Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3, textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      margin: '0 auto',
                      mb: 2,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    QR Code
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Scan to access form instantly
                  </Typography>

                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha('#f59e0b', 0.05),
                      border: `2px dashed ${alpha('#f59e0b', 0.3)}`,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 180,
                        height: 180,
                        margin: '0 auto',
                        bgcolor: 'white',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <QrCodeIcon sx={{ fontSize: 120, color: alpha('#000', 0.1) }} />
                    </Box>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    QR code generation coming soon
                  </Typography>

                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: '#f59e0b',
                      color: '#f59e0b',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': {
                        borderColor: '#d97706',
                        bgcolor: alpha('#f59e0b', 0.05),
                      },
                    }}
                  >
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>

              {/* Form Preview Card */}
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
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Form Preview
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      bgcolor: alpha('#6366f1', 0.05),
                      border: `1px solid ${alpha('#6366f1', 0.1)}`,
                    }}
                  >
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                      {selectedForm?.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedForm?.description || 'No description'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Status
                          </Typography>
                          <Chip
                            label={selectedForm?.status || 'Draft'}
                            size="small"
                            sx={{
                              bgcolor: selectedForm?.status === 'PUBLISHED'
                                ? alpha('#10b981', 0.1)
                                : alpha('#f59e0b', 0.1),
                              color: selectedForm?.status === 'PUBLISHED' ? '#10b981' : '#f59e0b',
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Views
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <VisibilityIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                            <Typography variant="body2" fontWeight={600}>
                              {selectedForm?.views || 0}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    component="a"
                    href={formUrl}
                    target="_blank"
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      textTransform: 'none',
                      fontWeight: 700,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 16px ${alpha('#6366f1', 0.3)}`,
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Preview Form
                  </Button>
                </CardContent>
              </Card>

              {/* Share Stats Card */}
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
                  <Typography variant="h6" color="white" fontWeight={700} sx={{ mb: 2 }}>
                    Share Tips
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Share on social media for wider reach
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Use QR codes for offline events
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Embed on your website for seamless UX
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Track views in analytics dashboard
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
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            icon={<CheckCircleIcon fontSize="inherit" />}
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[8],
            }}
          >
            {copiedType === 'link' ? 'Link copied!' : 'Embed code copied!'}
          </Alert>
        </Snackbar>
      </Box>
    </UserLayout>
  );
};

export default Share;
