import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpIcon,
  Email as EmailIcon,
  QuestionAnswer as QuestionIcon,
  Book as BookIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';

const HelpPage = () => {
  const faqs = [
    {
      question: 'How do I create a payment form?',
      answer: 'Go to Dashboard → Create New Form → Select "Payment Forms". Fill in your form details, add products with prices, select your payment gateway (Stripe, PayPal, etc.), and click "Create Payment Form".',
    },
    {
      question: 'How can I test payment forms?',
      answer: 'Use test card: 4242 4242 4242 4242 with any future expiry date, any 3-digit CVC, and any ZIP code. The payment will be processed in test mode and no real charges will occur.',
    },
    {
      question: 'How do I publish a form?',
      answer: 'After creating your form in the Form Builder, click the "Publish" tab at the top. Set the form status to "Published" and copy the public form URL to share with users.',
    },
    {
      question: 'Where can I see form submissions?',
      answer: 'Go to Dashboard → Submissions. You\'ll see all form submissions with their data, including payment information if it\'s a payment form.',
    },
    {
      question: 'How do I convert a PDF to an online form?',
      answer: 'Go to Dashboard → Create New Form → Select "Smart PDF Form". Upload your PDF file, and the system will automatically detect fields and create an online form.',
    },
    {
      question: 'What payment gateways are supported?',
      answer: 'We support Stripe, PayPal, Square, Authorize.Net, Braintree, and Mollie. You can select your preferred gateway when creating a payment form.',
    },
    {
      question: 'Can I collect electronic signatures?',
      answer: 'Yes! Go to Dashboard → Create New Form → Select "E-sign Forms". You can add multiple signers with different roles and collect legally binding electronic signatures.',
    },
    {
      question: 'How do I import an existing form?',
      answer: 'Go to Dashboard → Create New Form → Select "Import Form". You can import forms from a URL or paste HTML code to convert them into our form builder.',
    },
    {
      question: 'Can I customize form themes?',
      answer: 'Yes! In the Form Builder, go to the Settings tab where you can customize colors, fonts, and styling options for your form.',
    },
    {
      question: 'How do I integrate forms with other apps?',
      answer: 'Go to Dashboard → Integrations to connect your forms with apps like Google Sheets, Mailchimp, Slack, and more. You can also use Webhooks for custom integrations.',
    },
  ];

  const quickLinks = [
    {
      title: 'Documentation',
      description: 'Read our comprehensive guides',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      action: () => window.open('https://www.pabbly.com/tutorials/pabbly-form-builder/', '_blank'),
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      action: () => window.location.href = 'mailto:support@pabbly.com',
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step videos',
      icon: <QuestionIcon sx={{ fontSize: 40 }} />,
      action: () => window.open('https://www.youtube.com/@Pabbly', '_blank'),
    },
  ];

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Quick Links */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {quickLinks.map((link, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={link.action}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {link.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {link.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {link.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQs */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Quick answers to common questions about Pabbly Form Builder
          </Typography>

          <Stack spacing={2}>
            {faqs.map((faq, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Paper>

        {/* Still Need Help */}
        <Paper
          sx={{
            mt: 4,
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
            color: 'white',
          }}
        >
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Still Need Help?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Our support team is here to help you with any questions
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<EmailIcon />}
            onClick={() => window.location.href = 'mailto:support@pabbly.com'}
            sx={{
              bgcolor: 'white',
              color: '#1a73e8',
              fontWeight: 600,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Contact Support
          </Button>
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default HelpPage;
