import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Chip,
  Grid,
  Alert,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  PictureAsPdf as PdfIcon,
  Draw as SignatureIcon,
  Download as ImportIcon,
  PlayArrow as TestIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';

const TestFeaturesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const testScenarios = [
    {
      id: 'payment',
      title: 'Payment Forms',
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      description: 'Test payment form creation with products and pricing',
      tests: [
        'Create a product order form with Stripe',
        'Add multiple products with different prices',
        'Test subscription form (monthly/yearly)',
        'Test donation form with custom amounts',
        'Try different payment gateways (PayPal, Square)',
        'Test currency switching (USD, EUR, GBP)',
      ],
      route: '/dashboard/forms/payment',
      testData: {
        title: 'Product Order Form - Test',
        paymentType: 'one-time',
        gateway: 'stripe',
        items: [
          { name: 'Premium T-Shirt', price: 29.99 },
          { name: 'Basic T-Shirt', price: 19.99 },
        ],
      },
    },
    {
      id: 'pdf',
      title: 'PDF Form Converter',
      icon: <PdfIcon sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      description: 'Test PDF to online form conversion',
      tests: [
        'Upload a sample PDF form',
        'Test drag-and-drop functionality',
        'Check field detection accuracy',
        'Verify conversion progress indicator',
        'Test with different PDF types',
        'Validate converted form structure',
      ],
      route: '/dashboard/forms/pdf-converter',
      testData: {
        note: 'Use any PDF form from your computer or download a sample PDF form online',
      },
    },
    {
      id: 'esign',
      title: 'E-Sign Forms',
      icon: <SignatureIcon sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      description: 'Test electronic signature collection',
      tests: [
        'Create a contract signing form',
        'Add multiple signers with different roles',
        'Test signature field placement',
        'Enable/disable timestamp and IP logging',
        'Test email reminder settings',
        'Verify legal compliance features',
      ],
      route: '/dashboard/forms/esign',
      testData: {
        title: 'Employment Contract - Test',
        document: 'Standard Employment Agreement',
        signers: [
          { role: 'Employee', name: 'John Doe' },
          { role: 'Employer', name: 'Company HR' },
        ],
      },
    },
    {
      id: 'import',
      title: 'Import Form',
      icon: <ImportIcon sx={{ fontSize: 40 }} />,
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      description: 'Test form import from URL or HTML',
      tests: [
        'Import from a Google Form URL',
        'Test HTML code import',
        'Verify field detection',
        'Check field type conversion',
        'Test with complex forms',
        'Validate import accuracy',
      ],
      route: '/dashboard/forms/import',
      testData: {
        sampleUrl: 'https://forms.gle/example',
        sampleHtml: '<form><input type="text" name="name"/><input type="email" name="email"/></form>',
      },
    },
  ];

  const handleStartTest = (route: string) => {
    navigate(route);
  };

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <TestIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h3" fontWeight={700}>
                Test New Features
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Comprehensive testing guide for all new form builder features
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Testing Instructions:
            </Typography>
            <Typography variant="body2">
              • Click "Start Test" on each feature to begin testing
              <br />• Follow the test checklist for comprehensive coverage
              <br />• All features work in simulation mode (frontend only)
              <br />• Backend integration can be added later for production use
            </Typography>
          </Alert>
        </Box>

        {/* Test Scenarios Grid */}
        <Grid container spacing={3}>
          {testScenarios.map((scenario) => (
            <Grid item xs={12} md={6} key={scenario.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 24px ${alpha(scenario.color, 0.3)}`,
                  },
                }}
              >
                {/* Card Header with Icon */}
                <Box
                  sx={{
                    background: scenario.gradient,
                    p: 3,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      borderRadius: 3,
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {scenario.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {scenario.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {scenario.description}
                    </Typography>
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Test Checklist */}
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Test Checklist:
                  </Typography>
                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {scenario.tests.map((test, index) => (
                      <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            minWidth: 28,
                            height: 24,
                            bgcolor: alpha(scenario.color, 0.1),
                            color: scenario.color,
                            fontWeight: 600,
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1, pt: 0.3 }}>
                          {test}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {/* Test Data Section */}
                  {scenario.testData && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: alpha(scenario.color, 0.03),
                          border: `1px solid ${alpha(scenario.color, 0.2)}`,
                        }}
                      >
                        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Sample Test Data:
                        </Typography>
                        {Object.entries(scenario.testData).map(([key, value]) => (
                          <Typography key={key} variant="body2" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
                            <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                          </Typography>
                        ))}
                      </Paper>
                    </>
                  )}

                  {/* Start Test Button */}
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<TestIcon />}
                    onClick={() => handleStartTest(scenario.route)}
                    sx={{
                      mt: 3,
                      background: scenario.gradient,
                      fontWeight: 600,
                      py: 1.5,
                      '&:hover': {
                        opacity: 0.9,
                      },
                    }}
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Overall Test Summary */}
        <Paper
          sx={{
            mt: 4,
            p: 4,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Expected Test Results
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                ✅ What Should Work:
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">All forms navigate correctly</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">Fields are properly created</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">Preview panels display correctly</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">Forms redirect to Form Builder</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <CheckIcon sx={{ fontSize: 20 }} />
                  <Typography variant="body2">All UI elements are responsive</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                ⚠️ Known Limitations (Frontend Only):
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">• Payment processing is simulated</Typography>
                <Typography variant="body2">• PDF parsing is mocked</Typography>
                <Typography variant="body2">• E-signatures don't send actual emails</Typography>
                <Typography variant="body2">• Form import uses sample data</Typography>
                <Typography variant="body2">• Backend API integration needed for production</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Quick Actions */}
        <Paper sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/forms/create')}
            >
              Back to Form Creation
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/forms')}
            >
              View All Forms
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Stack>
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default TestFeaturesPage;
