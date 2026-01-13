import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  Http as HttpIcon,
  Security as SecurityIcon,
  Description as DescriptionIcon,
  Send as SendIcon,
  List as ListIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`api-tabpanel-${index}`}
      aria-labelledby={`api-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Paper
      sx={{
        bgcolor: '#1e1e1e',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1,
          bgcolor: '#2d2d2d',
          borderBottom: '1px solid #404040',
        }}
      >
        <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase' }}>
          {language}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton size="small" onClick={handleCopy} sx={{ color: '#888' }}>
            {copied ? <CheckCircleIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 2,
          overflow: 'auto',
          fontSize: '0.875rem',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          color: '#d4d4d4',
          lineHeight: 1.6,
        }}
      >
        <code>{code}</code>
      </Box>
    </Paper>
  );
};

const EndpointCard = ({
  method,
  endpoint,
  description,
  requestBody,
  responseExample,
}: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  description: string;
  requestBody?: string;
  responseExample: string;
}) => {
  const methodColors: Record<string, string> = {
    GET: '#10b981',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    DELETE: '#ef4444',
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Chip
            label={method}
            size="small"
            sx={{
              bgcolor: methodColors[method],
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'monospace',
              bgcolor: '#f5f5f5',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.9rem',
            }}
          >
            {endpoint}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        {requestBody && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Request Body
            </Typography>
            <CodeBlock code={requestBody} language="json" />
          </Box>
        )}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Response Example
          </Typography>
          <CodeBlock code={responseExample} language="json" />
        </Box>
      </CardContent>
    </Card>
  );
};

const ApiDocumentation = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const baseUrl = 'http://localhost:5000/api';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodeIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                API Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Integrate Pabbly Form Builder with your applications
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Quick Start */}
        <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
          <Typography variant="body2">
            <strong>Base URL:</strong>{' '}
            <code style={{ background: '#e3f2fd', padding: '2px 6px', borderRadius: 4 }}>
              {baseUrl}/v1
            </code>{' '}
            - All API requests require authentication via API key in the header.
          </Typography>
        </Alert>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Authentication" />
            <Tab icon={<ArticleIcon />} iconPosition="start" label="Forms" />
            <Tab icon={<SendIcon />} iconPosition="start" label="Submissions" />
            <Tab icon={<HttpIcon />} iconPosition="start" label="Webhooks" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {/* Authentication Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                API Key Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                All API requests must include your API key in the Authorization header. You can find your API key in the API Keys section of your dashboard.
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Authentication Header
              </Typography>
              <CodeBlock
                code={`Authorization: Bearer YOUR_API_KEY

# Example with cURL
curl -X GET "${baseUrl}/v1/forms" \\
  -H "Authorization: Bearer pbk_your_api_key_here" \\
  -H "Content-Type: application/json"`}
                language="bash"
              />

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Error Responses
                </Typography>
                <CodeBlock
                  code={`// 401 Unauthorized - Invalid or missing API key
{
  "error": "Invalid API key"
}

// 403 Forbidden - API key doesn't have permission
{
  "error": "Access denied"
}`}
                  language="json"
                />
              </Box>
            </TabPanel>

            {/* Forms Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Forms API
              </Typography>

              <EndpointCard
                method="GET"
                endpoint="/v1/forms"
                description="Retrieve all forms for the authenticated user."
                responseExample={`{
  "success": true,
  "forms": [
    {
      "id": "form_abc123",
      "title": "Contact Form",
      "description": "Get in touch with us",
      "status": "PUBLISHED",
      "views": 150,
      "submissionCount": 45,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-20T14:20:00Z"
    }
  ]
}`}
              />

              <EndpointCard
                method="GET"
                endpoint="/v1/forms/:id"
                description="Retrieve a specific form by ID, including recent submissions."
                responseExample={`{
  "success": true,
  "form": {
    "id": "form_abc123",
    "title": "Contact Form",
    "description": "Get in touch with us",
    "fields": [
      {
        "id": "field_1",
        "type": "email",
        "label": "Email Address",
        "required": true
      },
      {
        "id": "field_2",
        "type": "textarea",
        "label": "Message",
        "required": true
      }
    ],
    "status": "PUBLISHED",
    "submissions": [...]
  }
}`}
              />
            </TabPanel>

            {/* Submissions Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Submissions API
              </Typography>

              <EndpointCard
                method="GET"
                endpoint="/v1/forms/:formId/submissions"
                description="Retrieve all submissions for a specific form. Supports pagination with limit and offset query parameters."
                responseExample={`{
  "success": true,
  "submissions": [
    {
      "id": "sub_xyz789",
      "formId": "form_abc123",
      "data": {
        "email": "user@example.com",
        "message": "Hello, I have a question..."
      },
      "status": "NEW",
      "createdAt": "2024-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 50,
    "offset": 0
  }
}`}
              />

              <EndpointCard
                method="GET"
                endpoint="/v1/submissions/:id"
                description="Retrieve a specific submission by ID."
                responseExample={`{
  "success": true,
  "submission": {
    "id": "sub_xyz789",
    "formId": "form_abc123",
    "data": {
      "email": "user@example.com",
      "message": "Hello, I have a question..."
    },
    "status": "NEW",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-20T14:30:00Z"
  }
}`}
              />

              <EndpointCard
                method="POST"
                endpoint="/submissions/:formId/submit"
                description="Submit data to a published form. This is a public endpoint and doesn't require authentication."
                requestBody={`{
  "email": "user@example.com",
  "name": "John Doe",
  "message": "Hello, I have a question about your service."
}`}
                responseExample={`{
  "success": true,
  "message": "Form submitted successfully",
  "submission": {
    "id": "sub_xyz789",
    "formId": "form_abc123",
    "status": "NEW",
    "createdAt": "2024-01-20T14:30:00Z"
  }
}`}
              />
            </TabPanel>

            {/* Webhooks Tab */}
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                Webhooks API
              </Typography>

              <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                  Webhooks allow you to receive real-time notifications when events occur in your forms, such as new submissions.
                </Typography>
              </Alert>

              <EndpointCard
                method="GET"
                endpoint="/v1/webhooks"
                description="Retrieve all webhooks for the authenticated user."
                responseExample={`{
  "success": true,
  "webhooks": [
    {
      "id": "wh_abc123",
      "name": "Slack Notification",
      "url": "https://hooks.slack.com/...",
      "events": ["form.submitted"],
      "isActive": true,
      "lastTriggered": "2024-01-20T14:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`}
              />

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Webhook Payload Structure
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  When a form is submitted, your webhook endpoint will receive the following payload:
                </Typography>
                <CodeBlock
                  code={`{
  "event": "form.submitted",
  "timestamp": "2024-01-20T14:30:00.000Z",
  "data": {
    "formId": "form_abc123",
    "formTitle": "Contact Form",
    "submissionId": "sub_xyz789",
    "submissionData": {
      "email": "user@example.com",
      "name": "John Doe",
      "message": "Hello..."
    }
  }
}`}
                  language="json"
                />
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                  Webhook Security
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Each webhook request includes a signature in the <code>X-Webhook-Signature</code> header for verification:
                </Typography>
                <CodeBlock
                  code={`// Verify webhook signature (Node.js example)
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}

// Headers included in webhook requests:
// X-Webhook-Signature: <HMAC-SHA256 signature>
// X-Webhook-Event: form.submitted
// X-Webhook-Timestamp: 2024-01-20T14:30:00.000Z
// X-Webhook-Id: wh_abc123`}
                  language="javascript"
                />
              </Box>
            </TabPanel>
          </Box>
        </Paper>

        {/* Rate Limits */}
        <Card sx={{ mt: 4, borderRadius: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <ListIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Rate Limits
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              API requests are rate limited based on your plan:
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Free Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1,000 requests / month
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Pro Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  10,000 requests / month
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Enterprise Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Unlimited requests
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </UserLayout>
  );
};

export default ApiDocumentation;
