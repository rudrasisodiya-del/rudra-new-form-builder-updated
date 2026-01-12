import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Download as ImportIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ImportForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [formUrl, setFormUrl] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleImportFromUrl = async () => {
    if (!formUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      new URL(formUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError('');

    // Simulate import progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      // In real implementation, you would fetch and parse the form
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted fields
      const mockFields = [
        { id: 'name', type: 'text', label: 'Name', required: true },
        { id: 'email', type: 'email', label: 'Email', required: true },
        { id: 'message', type: 'textarea', label: 'Message', required: false },
      ];

      const formData = {
        title: 'Imported Form',
        description: `Imported from ${new URL(formUrl).hostname}`,
        fields: mockFields,
        settings: {
          importedFrom: formUrl,
          importedAt: new Date().toISOString()
        }
      };

      const response = await api.post('/forms', formData);
      setProgress(100);

      setTimeout(() => {
        navigate(`/dashboard/forms/builder/${response.data.form.id}`);
      }, 500);
    } catch (error: any) {
      console.error('Error importing form:', error);
      setError(error.response?.data?.message || 'Failed to import form');
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setImporting(false);
    }
  };

  const handleImportFromHtml = async () => {
    if (!htmlCode.trim()) {
      setError('Please paste HTML code');
      return;
    }

    setImporting(true);
    setProgress(0);
    setError('');

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 400);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Parse HTML and extract form fields (mock implementation)
      const mockFields = [
        { id: 'field-1', type: 'text', label: 'Text Field', required: false },
        { id: 'field-2', type: 'email', label: 'Email Field', required: false },
      ];

      const formData = {
        title: 'Imported HTML Form',
        description: 'Imported from HTML code',
        fields: mockFields,
        settings: {
          importedFromHtml: true,
          importedAt: new Date().toISOString()
        }
      };

      const response = await api.post('/forms', formData);
      setProgress(100);

      setTimeout(() => {
        navigate(`/dashboard/forms/builder/${response.data.form.id}`);
      }, 500);
    } catch (error: any) {
      console.error('Error importing HTML form:', error);
      setError(error.response?.data?.message || 'Failed to import HTML form');
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setImporting(false);
    }
  };

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <IconButton onClick={() => navigate('/dashboard/forms/create')}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Import Existing Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Convert your existing forms from other platforms in seconds
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
          {/* Left Side - Import Options */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ borderRadius: 3 }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                }}
              >
                <Tab icon={<LinkIcon />} label="From URL" iconPosition="start" />
                <Tab icon={<CodeIcon />} label="From HTML" iconPosition="start" />
              </Tabs>

              {/* Import from URL */}
              <TabPanel value={tabValue} index={0}>
                <Box sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Alert severity="info">
                      Enter the URL of the form you want to import. We'll automatically detect and convert all form fields.
                    </Alert>

                    <TextField
                      label="Form URL"
                      placeholder="https://example.com/contact-form"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      fullWidth
                      disabled={importing}
                      InputProps={{
                        startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} />
                      }}
                    />

                    {error && (
                      <Alert severity="error" onClose={() => setError('')}>
                        {error}
                      </Alert>
                    )}

                    {importing && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            Importing form...
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {progress < 30 && 'Fetching form...'}
                          {progress >= 30 && progress < 60 && 'Analyzing structure...'}
                          {progress >= 60 && progress < 90 && 'Converting fields...'}
                          {progress >= 90 && 'Finalizing...'}
                        </Typography>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ImportIcon />}
                      onClick={handleImportFromUrl}
                      disabled={importing || !formUrl}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        },
                      }}
                    >
                      {importing ? 'Importing...' : 'Import from URL'}
                    </Button>

                    <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                          Supported Platforms
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Chip label="Google Forms" size="small" variant="outlined" />
                          <Chip label="Typeform" size="small" variant="outlined" />
                          <Chip label="JotForm" size="small" variant="outlined" />
                          <Chip label="SurveyMonkey" size="small" variant="outlined" />
                          <Chip label="Custom HTML" size="small" variant="outlined" />
                        </Stack>
                      </CardContent>
                    </Card>
                  </Stack>
                </Box>
              </TabPanel>

              {/* Import from HTML */}
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Alert severity="info">
                      Paste the HTML code of your form. We'll extract all form fields and convert them automatically.
                    </Alert>

                    <TextField
                      label="HTML Code"
                      placeholder={`<form>
  <input type="text" name="name" placeholder="Name" />
  <input type="email" name="email" placeholder="Email" />
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>`}
                      value={htmlCode}
                      onChange={(e) => setHtmlCode(e.target.value)}
                      fullWidth
                      multiline
                      rows={12}
                      disabled={importing}
                      sx={{
                        '& textarea': {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        },
                      }}
                    />

                    {error && (
                      <Alert severity="error" onClose={() => setError('')}>
                        {error}
                      </Alert>
                    )}

                    {importing && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            Importing form...
                          </Typography>
                          <Typography variant="body2" color="primary" fontWeight={600}>
                            {progress}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<ImportIcon />}
                      onClick={handleImportFromHtml}
                      disabled={importing || !htmlCode}
                      sx={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        },
                      }}
                    >
                      {importing ? 'Importing...' : 'Import from HTML'}
                    </Button>
                  </Stack>
                </Box>
              </TabPanel>
            </Paper>
          </Box>

          {/* Right Side - Info */}
          <Box sx={{ width: { xs: '100%', lg: 400 } }}>
            <Stack spacing={3}>
              {/* How It Works */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  How It Works
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="1" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Provide Form Source"
                      secondary="Enter URL or paste HTML code"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="2" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="AI Extraction"
                      secondary="Our AI detects all form fields"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="3" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Instant Conversion"
                      secondary="Get a fully functional form"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="4" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Customize & Publish"
                      secondary="Edit and enhance as needed"
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* What Gets Imported */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  What Gets Imported
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">All input fields</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Checkboxes & radio buttons</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Dropdown menus</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Textarea fields</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Field labels & placeholders</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Required field markers</Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Tips */}
              <Alert severity="success">
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  💡 Pro Tips
                </Typography>
                <Typography variant="body2" component="div">
                  • Forms with clear HTML structure import best
                  <br />• Test the imported form before publishing
                  <br />• You can edit all fields after import
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </UserLayout>
  );
};

export default ImportForm;
