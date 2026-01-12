import { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  Grid,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

interface MockPaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
}

const MockPaymentForm = ({ amount, currency, onSuccess, onError }: MockPaymentFormProps) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');

  const handleSubmit = async () => {
    // Validate card number
    if (cardNumber.replace(/\s/g, '') !== '4242424242424242') {
      setError('Invalid card number. Use 4242 4242 4242 4242 for testing');
      onError('Invalid card number');
      return;
    }

    if (!expiry || !cvc || !zip) {
      setError('Please fill in all payment fields');
      onError('Missing payment information');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful payment
      const paymentData = {
        paymentMethodId: `pm_test_${Date.now()}`,
        amount: amount,
        currency: currency,
        status: 'succeeded',
        timestamp: new Date().toISOString(),
        testMode: true,
        cardBrand: 'visa',
        cardLast4: '4242',
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiry(value);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvc(value);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 5) {
      setZip(value);
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
            🧪 Test Mode - Use test card:
          </Typography>
          <Typography variant="body2" component="div">
            • Card: 4242 4242 4242 4242
            <br />• Expiry: Any future date (e.g., 12/29)
            <br />• CVC: Any 3 digits (e.g., 123)
            <br />• ZIP: Any 5 digits (e.g., 12345)
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
            Card Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                disabled={succeeded}
                inputProps={{
                  maxLength: 19,
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="MM/YY"
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="12/29"
                disabled={succeeded}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="CVC"
                value={cvc}
                onChange={handleCvcChange}
                placeholder="123"
                disabled={succeeded}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="ZIP"
                value={zip}
                onChange={handleZipChange}
                placeholder="12345"
                disabled={succeeded}
              />
            </Grid>
          </Grid>
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
            Payment successful! You can now submit the form.
          </Alert>
        )}

        <Button
          type="button"
          variant="contained"
          size="large"
          fullWidth
          disabled={processing || succeeded}
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
            Test Mode - No Real Charges
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MockPaymentForm;
