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
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Draw as SignatureIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ESignFormBuilder = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [signers, setSigners] = useState<Signer[]>([
    { id: '1', name: '', email: '', role: 'Signer' }
  ]);
  const [requireAllSignatures, setRequireAllSignatures] = useState(true);
  const [sendReminders, setSendReminders] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [includeIPAddress, setIncludeIPAddress] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleAddSigner = () => {
    setSigners([...signers, {
      id: Date.now().toString(),
      name: '',
      email: '',
      role: 'Signer'
    }]);
  };

  const handleRemoveSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter(signer => signer.id !== id));
    }
  };

  const handleSignerChange = (id: string, field: string, value: string) => {
    setSigners(signers.map(signer =>
      signer.id === id ? { ...signer, [field]: value } : signer
    ));
  };

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form title');
      return;
    }

    if (!documentTitle.trim()) {
      alert('Please enter a document title');
      return;
    }

    if (signers.some(signer => !signer.name.trim() || !signer.email.trim())) {
      alert('Please fill in all signer names and emails');
      return;
    }

    setSaving(true);
    try {
      // Build form fields
      const fields = [
        {
          id: 'heading-1',
          type: 'heading',
          label: formTitle,
          required: false
        },
        {
          id: 'document-title',
          type: 'heading',
          label: documentTitle,
          required: false
        },
        {
          id: 'terms',
          type: 'termsandconditions',
          label: 'Terms and Conditions',
          required: true
        }
      ];

      // Add signature field for each signer
      signers.forEach((signer, index) => {
        fields.push(
          {
            id: `signer-name-${index}`,
            type: 'text',
            label: `${signer.role} Name`,
            required: true
          },
          {
            id: `signer-email-${index}`,
            type: 'email',
            label: `${signer.role} Email`,
            required: true
          },
          {
            id: `signature-${index}`,
            type: 'signature',
            label: `${signer.role} Signature`,
            required: requireAllSignatures
          }
        );

        if (includeTimestamp) {
          fields.push({
            id: `timestamp-${index}`,
            type: 'date',
            label: `${signer.role} Signature Date`,
            required: true
          });
        }
      });

      const formData = {
        title: formTitle,
        description: formDescription || 'E-signature document',
        fields,
        settings: {
          esignEnabled: true,
          documentTitle,
          signers: signers.map(s => ({ name: s.name, email: s.email, role: s.role })),
          requireAllSignatures,
          sendReminders,
          includeTimestamp,
          includeIPAddress
        }
      };

      const response = await api.post('/forms', formData);
      navigate(`/dashboard/forms/builder/${response.data.form.id}`);
    } catch (error) {
      console.error('Error creating e-sign form:', error);
      alert('Failed to create e-sign form');
    } finally {
      setSaving(false);
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
              Create E-Sign Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collect legally binding electronic signatures online
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
          {/* Left Side - Form Builder */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 4, borderRadius: 3 }}>
              <Stack spacing={3}>
                {/* Form Title */}
                <TextField
                  label="Form Title"
                  placeholder="e.g., Contract Agreement, NDA, Consent Form"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  fullWidth
                  required
                />

                {/* Form Description */}
                <TextField
                  label="Form Description (Optional)"
                  placeholder="Describe what this document is for"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                {/* Document Title */}
                <TextField
                  label="Document Title"
                  placeholder="e.g., Employment Contract, Service Agreement"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  fullWidth
                  required
                  helperText="This will be displayed at the top of the document"
                />

                <Divider />

                {/* Signers Section */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Signers
                    </Typography>
                    <Button
                      startIcon={<AddIcon />}
                      onClick={handleAddSigner}
                      variant="outlined"
                      size="small"
                    >
                      Add Signer
                    </Button>
                  </Stack>

                  <Stack spacing={2}>
                    {signers.map((signer, index) => (
                      <Card key={signer.id} variant="outlined">
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle2" color="text.secondary">
                                Signer #{index + 1}
                              </Typography>
                              {signers.length > 1 && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveSigner(signer.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                            <TextField
                              label="Role"
                              placeholder="e.g., Client, Employee, Contractor"
                              value={signer.role}
                              onChange={(e) => handleSignerChange(signer.id, 'role', e.target.value)}
                              fullWidth
                            />
                            <TextField
                              label="Name (Optional)"
                              placeholder="Leave blank to collect during signing"
                              value={signer.name}
                              onChange={(e) => handleSignerChange(signer.id, 'name', e.target.value)}
                              fullWidth
                              InputProps={{
                                startAdornment: <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                              }}
                            />
                            <TextField
                              label="Email (Optional)"
                              placeholder="Leave blank to collect during signing"
                              type="email"
                              value={signer.email}
                              onChange={(e) => handleSignerChange(signer.id, 'email', e.target.value)}
                              fullWidth
                              InputProps={{
                                startAdornment: <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                              }}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>

                <Divider />

                {/* Settings */}
                <Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Signature Settings
                  </Typography>
                  <Stack spacing={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={requireAllSignatures}
                          onChange={(e) => setRequireAllSignatures(e.target.checked)}
                        />
                      }
                      label="Require all signatures to complete"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sendReminders}
                          onChange={(e) => setSendReminders(e.target.checked)}
                        />
                      }
                      label="Send email reminders to sign"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeTimestamp}
                          onChange={(e) => setIncludeTimestamp(e.target.checked)}
                        />
                      }
                      label="Include signature timestamp"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={includeIPAddress}
                          onChange={(e) => setIncludeIPAddress(e.target.checked)}
                        />
                      }
                      label="Record IP address (for legal validity)"
                    />
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CheckIcon />}
                    onClick={handleCreateForm}
                    disabled={saving}
                    sx={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      },
                    }}
                  >
                    {saving ? 'Creating...' : 'Create E-Sign Form'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/dashboard/forms/create')}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Box>

          {/* Right Side - Info */}
          <Box sx={{ width: { xs: '100%', lg: 400 } }}>
            <Stack spacing={3}>
              {/* Preview */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.success.main, 0.03),
                  border: `2px dashed ${alpha(theme.palette.success.main, 0.3)}`,
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <SignatureIcon color="success" />
                    <Typography variant="h6" fontWeight={600}>
                      Form Preview
                    </Typography>
                  </Stack>

                  <Divider />

                  {formTitle ? (
                    <>
                      <Typography variant="h5" fontWeight={700}>
                        {formTitle}
                      </Typography>
                      {documentTitle && (
                        <Typography variant="h6" color="text.secondary">
                          {documentTitle}
                        </Typography>
                      )}

                      <Divider />

                      <Typography variant="subtitle2" fontWeight={600}>
                        Signers Required: {signers.length}
                      </Typography>

                      <Stack spacing={1}>
                        {signers.map((signer, index) => (
                          <Chip
                            key={signer.id}
                            icon={<SignatureIcon />}
                            label={signer.role || `Signer ${index + 1}`}
                            variant="outlined"
                            color="success"
                          />
                        ))}
                      </Stack>
                    </>
                  ) : (
                    <Alert severity="info">
                      Fill in the form details to see a preview
                    </Alert>
                  )}
                </Stack>
              </Paper>

              {/* Features */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  E-Signature Features
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Legally Binding"
                      secondary="Compliant with ESIGN Act"
                      secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Audit Trail"
                      secondary="Track who signed and when"
                      secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Notifications"
                      secondary="Automatic reminders to signers"
                      secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon sx={{ color: 'white' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Secure Storage"
                      secondary="Encrypted document storage"
                      secondaryTypographyProps={{ sx: { color: 'rgba(255,255,255,0.8)' } }}
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* Tips */}
              <Alert severity="warning">
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  ⚖️ Legal Notice
                </Typography>
                <Typography variant="body2">
                  E-signatures are legally binding in most countries. Make sure to include clear terms and conditions.
                </Typography>
              </Alert>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </UserLayout>
  );
};

export default ESignFormBuilder;
