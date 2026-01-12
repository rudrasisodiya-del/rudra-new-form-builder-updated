import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Chip,
  IconButton,
  Alert,
  useTheme,
  alpha,
  Rating,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';

interface GeneratedField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

const AIFormGenerator = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedFields, setGeneratedFields] = useState<GeneratedField[]>([]);
  const [formTitle, setFormTitle] = useState('');

  const examplePrompts = [
    'Create a customer feedback form with rating and comments',
    'Build a job application form with personal info and resume upload',
    'Make an event registration form with name, email, and number of attendees',
    'Design a contact form for customer support',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);

    // Simulate AI generation (replace with actual AI API call)
    setTimeout(() => {
      // Mock AI response based on keywords
      const mockGeneration = generateMockForm(prompt);
      setFormTitle(mockGeneration.title);
      setGeneratedFields(mockGeneration.fields);
      setGenerating(false);
    }, 2000);
  };

  const generateMockForm = (userPrompt: string): { title: string; fields: GeneratedField[] } => {
    const lowerPrompt = userPrompt.toLowerCase();

    // Detect form type from prompt
    if (lowerPrompt.includes('feedback') || lowerPrompt.includes('survey')) {
      return {
        title: 'Customer Feedback Form',
        fields: [
          { id: '1', type: 'text', label: 'Full Name', required: true },
          { id: '2', type: 'email', label: 'Email Address', required: true },
          {
            id: '3',
            type: 'rating',
            label: 'How satisfied are you with our service?',
            required: true,
          },
          {
            id: '4',
            type: 'select',
            label: 'What can we improve?',
            options: ['Product Quality', 'Customer Service', 'Delivery Time', 'Pricing', 'Other'],
            required: false,
          },
          { id: '5', type: 'textarea', label: 'Additional Comments', placeholder: 'Share your thoughts...', required: false },
        ],
      };
    } else if (lowerPrompt.includes('job') || lowerPrompt.includes('application')) {
      return {
        title: 'Job Application Form',
        fields: [
          { id: '1', type: 'text', label: 'Full Name', required: true },
          { id: '2', type: 'email', label: 'Email Address', required: true },
          { id: '3', type: 'tel', label: 'Phone Number', required: true },
          {
            id: '4',
            type: 'select',
            label: 'Position Applied For',
            options: ['Software Engineer', 'Product Manager', 'Designer', 'Marketing Specialist', 'Other'],
            required: true,
          },
          { id: '5', type: 'file', label: 'Upload Resume', required: true },
          { id: '6', type: 'textarea', label: 'Cover Letter', placeholder: 'Tell us why you\'re a great fit...', required: false },
        ],
      };
    } else if (lowerPrompt.includes('event') || lowerPrompt.includes('registration')) {
      return {
        title: 'Event Registration Form',
        fields: [
          { id: '1', type: 'text', label: 'Full Name', required: true },
          { id: '2', type: 'email', label: 'Email Address', required: true },
          { id: '3', type: 'tel', label: 'Phone Number', required: true },
          { id: '4', type: 'number', label: 'Number of Attendees', placeholder: '1', required: true },
          {
            id: '5',
            type: 'select',
            label: 'Meal Preference',
            options: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'No Preference'],
            required: false,
          },
          { id: '6', type: 'textarea', label: 'Special Requirements', placeholder: 'Any special needs or requests?', required: false },
        ],
      };
    } else if (lowerPrompt.includes('contact')) {
      return {
        title: 'Contact Form',
        fields: [
          { id: '1', type: 'text', label: 'Name', required: true },
          { id: '2', type: 'email', label: 'Email', required: true },
          { id: '3', type: 'text', label: 'Subject', required: true },
          { id: '4', type: 'textarea', label: 'Message', placeholder: 'How can we help you?', required: true },
        ],
      };
    } else {
      // Generic form
      return {
        title: 'Custom Form',
        fields: [
          { id: '1', type: 'text', label: 'Full Name', required: true },
          { id: '2', type: 'email', label: 'Email Address', required: true },
          { id: '3', type: 'tel', label: 'Phone Number', required: false },
          { id: '4', type: 'textarea', label: 'Message', placeholder: 'Enter your message...', required: true },
        ],
      };
    }
  };

  const handleUseForm = () => {
    // Navigate to form builder with generated fields
    navigate('/dashboard/forms/builder', {
      state: {
        aiGenerated: true,
        formTitle,
        fields: generatedFields,
      },
    });
  };

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} mb={4}>
          <IconButton onClick={() => navigate('/dashboard/forms/create')} sx={{ color: 'primary.main' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 28, color: 'white' }} />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px',
                  }}
                >
                  AI Form Generator
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  🤖 Describe your form and let AI build it instantly
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Chip
            label="BETA"
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        {/* Main Content */}
        <Stack spacing={3}>
          {/* Input Card */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Describe Your Form
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Tell the AI what kind of form you need. Be specific about the fields and purpose.
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: Create a customer feedback form with name, email, rating scale, and comments section..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: '#8b5cf6',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#8b5cf6',
                        },
                      },
                    }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || generating}
                  startIcon={generating ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
                    },
                    '&:disabled': {
                      background: alpha('#8b5cf6', 0.3),
                    },
                  }}
                >
                  {generating ? 'Generating...' : 'Generate Form'}
                </Button>

                {/* Example Prompts */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <LightbulbIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
                    <Typography variant="body2" fontWeight={600} color="text.secondary">
                      Try these examples:
                    </Typography>
                  </Stack>
                  <Stack spacing={1}>
                    {examplePrompts.map((example, index) => (
                      <Chip
                        key={index}
                        label={example}
                        onClick={() => setPrompt(example)}
                        sx={{
                          justifyContent: 'flex-start',
                          height: 'auto',
                          py: 1,
                          px: 2,
                          '& .MuiChip-label': {
                            whiteSpace: 'normal',
                            textAlign: 'left',
                          },
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: isDark ? alpha('#8b5cf6', 0.2) : alpha('#8b5cf6', 0.1),
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Generated Form Preview */}
          {generatedFields.length > 0 && (
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Generated Form Preview
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Review and customize your AI-generated form
                        </Typography>
                      </Box>
                      <Chip
                        icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                        label={`${generatedFields.length} Fields`}
                        color="primary"
                        size="small"
                      />
                    </Stack>

                    <Alert severity="success" sx={{ mb: 3 }}>
                      Form generated successfully! You can edit and customize it in the form builder.
                    </Alert>
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight={700} mb={3}>
                      {formTitle}
                    </Typography>

                    <Stack spacing={2.5}>
                      {generatedFields.map((field) => (
                        <Box key={field.id}>
                          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {field.label}
                            </Typography>
                            {field.required && (
                              <Chip label="Required" size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                            )}
                          </Stack>
                          {field.type === 'rating' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                              <Rating
                                name={`rating-${field.id}`}
                                defaultValue={0}
                                precision={1}
                                size="large"
                                emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                                sx={{
                                  '& .MuiRating-iconFilled': {
                                    color: '#f59e0b',
                                  },
                                  '& .MuiRating-iconHover': {
                                    color: '#d97706',
                                  },
                                }}
                              />
                            </Box>
                          ) : (
                            <TextField
                              fullWidth
                              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                              type={field.type === 'textarea' ? 'text' : field.type}
                              multiline={field.type === 'textarea'}
                              rows={field.type === 'textarea' ? 3 : 1}
                              disabled
                              select={field.type === 'select'}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                },
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleUseForm}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      },
                    }}
                  >
                    Use This Form
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Box>
    </UserLayout>
  );
};

export default AIFormGenerator;
