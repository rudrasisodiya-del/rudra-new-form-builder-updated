import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  Alert,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Payment as PaymentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import UserLayout from '../../components/layout/UserLayout';
import api from '../../services/api';

interface PaymentField {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
}

const PaymentFormBuilder = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('stripe');
  const [paymentType, setPaymentType] = useState('one-time'); // one-time, subscription, donation
  const [currency, setCurrency] = useState('USD');
  const [items, setItems] = useState<PaymentField[]>([
    { id: '1', name: '', description: '', price: 0, currency: 'USD' }
  ]);
  const [allowCustomAmount, setAllowCustomAmount] = useState(false);
  const [minimumAmount, setMinimumAmount] = useState(1);
  const [saving, setSaving] = useState(false);

  const paymentGateways = [
    { value: 'stripe', label: 'Stripe', icon: '💳' },
    { value: 'paypal', label: 'PayPal', icon: '🅿️' },
    { value: 'square', label: 'Square', icon: '⬛' },
    { value: 'authorize-net', label: 'Authorize.Net', icon: '🔐' },
    { value: 'braintree', label: 'Braintree', icon: '🧠' },
    { value: 'mollie', label: 'Mollie', icon: '🇳🇱' },
  ];

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'];

  const handleAddItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      currency
    }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleCreateForm = async () => {
    if (!formTitle.trim()) {
      alert('Please enter a form title');
      return;
    }

    if (items.some(item => !item.name.trim() || item.price <= 0)) {
      alert('Please fill in all item names and valid prices');
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
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true
        }
      ];

      // Add single payment field (not one per item)
      fields.push({
        id: `payment-${paymentGateway}`,
        type: 'payment',
        label: `Pay with ${paymentGateways.find(g => g.value === paymentGateway)?.label}`,
        required: true
      });

      const formData = {
        title: formTitle,
        description: formDescription || `${paymentType === 'subscription' ? 'Subscription' : paymentType === 'donation' ? 'Donation' : 'Payment'} form powered by ${paymentGateways.find(g => g.value === paymentGateway)?.label}`,
        fields,
        settings: {
          paymentEnabled: true,
          paymentGateway,
          paymentType,
          currency,
          allowCustomAmount: paymentType === 'donation' ? true : allowCustomAmount,
          minimumAmount: paymentType === 'donation' ? minimumAmount : undefined,
          items: paymentType !== 'donation' ? items : undefined
        }
      };

      const response = await api.post('/forms', formData);
      navigate(`/dashboard/forms/builder/${response.data.form.id}`);
    } catch (error) {
      console.error('Error creating payment form:', error);
      alert('Failed to create payment form');
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
              Create Payment Form
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Collect payments, subscriptions, or donations with ease
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
                  placeholder="e.g., Product Purchase, Monthly Subscription, Donation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  fullWidth
                  required
                />

                {/* Form Description */}
                <TextField
                  label="Form Description (Optional)"
                  placeholder="Describe what customers are paying for"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                />

                <Divider />

                {/* Payment Type */}
                <FormControl fullWidth>
                  <InputLabel>Payment Type</InputLabel>
                  <Select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    label="Payment Type"
                  >
                    <MenuItem value="one-time">One-Time Payment</MenuItem>
                    <MenuItem value="subscription">Recurring Subscription</MenuItem>
                    <MenuItem value="donation">Donation (Custom Amount)</MenuItem>
                  </Select>
                </FormControl>

                {/* Payment Gateway */}
                <FormControl fullWidth>
                  <InputLabel>Payment Gateway</InputLabel>
                  <Select
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    label="Payment Gateway"
                  >
                    {paymentGateways.map((gateway) => (
                      <MenuItem key={gateway.value} value={gateway.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <span>{gateway.icon}</span>
                          <span>{gateway.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Currency */}
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    label="Currency"
                  >
                    {currencies.map((curr) => (
                      <MenuItem key={curr} value={curr}>
                        {curr}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Divider />

                {/* Payment Items */}
                {paymentType !== 'donation' && (
                  <>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {paymentType === 'subscription' ? 'Subscription Plans' : 'Products/Services'}
                        </Typography>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={handleAddItem}
                          variant="outlined"
                          size="small"
                        >
                          Add Item
                        </Button>
                      </Stack>

                      <Stack spacing={2}>
                        {items.map((item, index) => (
                          <Card key={item.id} variant="outlined">
                            <CardContent>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Item #{index + 1}
                                  </Typography>
                                  {items.length > 1 && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveItem(item.id)}
                                      color="error"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Stack>
                                <TextField
                                  label="Item Name"
                                  placeholder={paymentType === 'subscription' ? 'e.g., Basic Plan, Premium Plan' : 'e.g., T-Shirt, Service Fee'}
                                  value={item.name}
                                  onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                  fullWidth
                                  required
                                />
                                <TextField
                                  label="Description"
                                  placeholder="Brief description of the item"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                  fullWidth
                                  multiline
                                  rows={2}
                                />
                                <TextField
                                  label={paymentType === 'subscription' ? 'Price per Month' : 'Price'}
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">{currency}</InputAdornment>
                                    ),
                                  }}
                                  fullWidth
                                  required
                                />
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </Box>

                    {paymentType === 'one-time' && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={allowCustomAmount}
                            onChange={(e) => setAllowCustomAmount(e.target.checked)}
                          />
                        }
                        label="Allow customers to enter custom amount"
                      />
                    )}
                  </>
                )}

                {/* Donation Settings */}
                {paymentType === 'donation' && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Donation forms allow users to enter any amount they wish to contribute.
                    </Alert>
                    <TextField
                      label="Minimum Donation Amount"
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(parseFloat(e.target.value))}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{currency}</InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Box>
                )}

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
                    {saving ? 'Creating...' : 'Create Payment Form'}
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

          {/* Right Side - Preview */}
          <Box sx={{ width: { xs: '100%', lg: 400 } }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                position: 'sticky',
                top: 24,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PaymentIcon color="primary" />
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
                    {formDescription && (
                      <Typography variant="body2" color="text.secondary">
                        {formDescription}
                      </Typography>
                    )}

                    <Divider />

                    <Stack spacing={1.5}>
                      <Chip
                        icon={<CreditCardIcon />}
                        label={`Gateway: ${paymentGateways.find(g => g.value === paymentGateway)?.label}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Type: ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Currency: ${currency}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Stack>

                    {paymentType !== 'donation' && items.length > 0 && (
                      <>
                        <Divider />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Items:
                        </Typography>
                        <Stack spacing={1}>
                          {items.filter(item => item.name).map((item) => (
                            <Box
                              key={item.id}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.paper',
                                border: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={600}>
                                  {item.name}
                                </Typography>
                                <Typography variant="body2" color="primary" fontWeight={700}>
                                  {currency} {item.price}
                                </Typography>
                              </Stack>
                              {item.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {item.description}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      </>
                    )}

                    {paymentType === 'donation' && (
                      <>
                        <Divider />
                        <Typography variant="body2" color="text.secondary">
                          Minimum amount: <strong>{currency} {minimumAmount}</strong>
                        </Typography>
                      </>
                    )}
                  </>
                ) : (
                  <Alert severity="info">
                    Fill in the form details to see a preview
                  </Alert>
                )}
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </Box>
    </UserLayout>
  );
};

export default PaymentFormBuilder;
