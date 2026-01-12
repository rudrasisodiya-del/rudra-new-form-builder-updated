import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

const StripePaymentForm = ({ amount, currency, onSuccess, onError }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // In test mode, we'll simulate a successful payment
      // In production, you would create a payment intent on your backend

      // For testing, we'll just validate the card and simulate success
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        onError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      // Simulate successful payment in test mode
      const paymentData = {
        paymentMethodId: paymentMethod.id,
        amount: amount,
        currency: currency,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
        testMode: true,
      };

      setSucceeded(true);
      onSuccess(paymentData);
      setProcessing(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment processing');
      onError(err.message || 'An error occurred');
      setProcessing(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '2px solid #e5e7eb',
          borderRadius: 2,
          bgcolor: '#f9fafb',
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Payment Details
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
            🧪 Test Mode - Use test cards:
          </Typography>
          <Typography variant="body2" component="div">
            • Success: 4242 4242 4242 4242
            <br />• Decline: 4000 0000 0000 0002
            <br />• Any future expiry date, any 3-digit CVC
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Card Information
          </Typography>
          <Box
            sx={{
              p: 2,
              border: '1px solid #d1d5db',
              borderRadius: 1,
              bgcolor: 'white',
              '&:focus-within': {
                borderColor: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
              },
            }}
          >
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1f2937',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    '::placeholder': {
                      color: '#9ca3af',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                  },
                },
                hidePostalCode: false,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'white',
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="body1" fontWeight={600}>
            Total Amount:
          </Typography>
          <Typography variant="h5" fontWeight={700} color="primary">
            {currency} {amount.toFixed(2)}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {succeeded && (
          <Alert severity="success" sx={{ mb: 2 }} icon={<LockIcon />}>
            Payment successful! Your submission has been recorded.
          </Alert>
        )}

        <Button
          type="button"
          variant="contained"
          size="large"
          fullWidth
          disabled={!stripe || processing || succeeded}
          onClick={handleSubmit}
          startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <LockIcon />}
          sx={{
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            background: succeeded
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            textTransform: 'none',
            '&:hover': {
              background: succeeded
                ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            },
            '&:disabled': {
              opacity: 0.6,
            },
          }}
        >
          {processing ? 'Processing Payment...' : succeeded ? 'Payment Complete ✓' : `Pay ${currency} ${amount.toFixed(2)}`}
        </Button>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <LockIcon sx={{ fontSize: 14 }} />
            Secured by Stripe • Test Mode
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default StripePaymentForm;
