import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  PictureAsPdf as PdfIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

const PDFFormConverter = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid PDF file');
        setSelectedFile(null);
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please drop a valid PDF file');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setConverting(true);
    setProgress(0);
    setError('');

    // Simulate conversion progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // In a real implementation, you would upload the PDF and process it
      // For now, we'll simulate the conversion with mock data
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted fields from PDF
      const mockFields = [
        { id: 'name', type: 'text', label: 'Full Name', required: true },
        { id: 'email', type: 'email', label: 'Email Address', required: true },
        { id: 'phone', type: 'text', label: 'Phone Number', required: false },
        { id: 'address', type: 'textarea', label: 'Address', required: false },
        { id: 'date', type: 'date', label: 'Date', required: false },
        { id: 'signature', type: 'signature', label: 'Signature', required: true },
      ];

      const formData = {
        title: selectedFile.name.replace('.pdf', ''),
        description: 'Converted from PDF form',
        fields: mockFields,
        settings: {
          convertedFromPdf: true,
          originalFileName: selectedFile.name
        }
      };

      const response = await api.post('/forms', formData);
      setProgress(100);

      setTimeout(() => {
        navigate(`/dashboard/forms/builder/${response.data.form.id}`);
      }, 500);
    } catch (error: any) {
      console.error('Error converting PDF:', error);
      setError(error.response?.data?.message || 'Failed to convert PDF form');
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setConverting(false);
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
              Smart PDF Form Converter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Convert your PDF forms to interactive online forms instantly
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
          {/* Left Side - Upload Area */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Stack spacing={3}>
                {/* Upload Zone */}
                <Box
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: `3px dashed ${selectedFile ? theme.palette.success.main : theme.palette.divider}`,
                    borderRadius: 3,
                    p: 6,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    bgcolor: selectedFile
                      ? alpha(theme.palette.success.main, 0.05)
                      : alpha(theme.palette.primary.main, 0.03),
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />

                  {selectedFile ? (
                    <Stack spacing={2} alignItems="center">
                      <PdfIcon sx={{ fontSize: 80, color: 'error.main' }} />
                      <Typography variant="h6" fontWeight={600}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<CloseIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2} alignItems="center">
                      <UploadIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
                      <Typography variant="h6" fontWeight={600}>
                        Drop your PDF here or click to browse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supported format: PDF (Max 10MB)
                      </Typography>
                      <Button variant="contained" size="large">
                        Select PDF File
                      </Button>
                    </Stack>
                  )}
                </Box>

                {/* Error Message */}
                {error && (
                  <Alert severity="error" onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}

                {/* Conversion Progress */}
                {converting && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Converting PDF...
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight={600}>
                        {progress}%
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {progress < 30 && 'Analyzing PDF structure...'}
                      {progress >= 30 && progress < 60 && 'Detecting form fields...'}
                      {progress >= 60 && progress < 90 && 'Converting to online form...'}
                      {progress >= 90 && 'Finalizing...'}
                    </Typography>
                  </Box>
                )}

                {/* Convert Button */}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AiIcon />}
                  onClick={handleConvert}
                  disabled={!selectedFile || converting}
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
                    },
                  }}
                >
                  {converting ? 'Converting...' : 'Convert to Online Form'}
                </Button>
              </Stack>
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
                      primary="Upload Your PDF"
                      secondary="Select a PDF form from your computer"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="2" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="AI Detection"
                      secondary="Our AI detects all form fields automatically"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="3" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Instant Conversion"
                      secondary="Get a fully functional online form in seconds"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label="4" size="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Customize"
                      secondary="Edit and customize your form as needed"
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* Features */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  What Gets Converted
                </Typography>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Text input fields</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Checkboxes and radio buttons</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Dropdown menus</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Date fields</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Signature fields</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">Form labels and titles</Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Tips */}
              <Alert severity="info">
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  💡 Pro Tips
                </Typography>
                <Typography variant="body2" component="div">
                  • Use clear, fillable PDF forms for best results
                  <br />• Ensure PDF fields have proper labels
                  <br />• File size should be under 10MB
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </UserLayout>
  );
};

export default PDFFormConverter;
