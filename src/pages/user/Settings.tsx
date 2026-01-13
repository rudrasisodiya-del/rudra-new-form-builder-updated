import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Divider,
  Chip,
  Grid,
  Avatar,
  IconButton,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
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
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [formSubmissions, setFormSubmissions] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string; previewUrl?: string } | null>(null);

  const theme = useTheme();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      const userData = response.data.user;
      setUser(userData);
      setName(userData.name || '');
      setEmail(userData.email || '');
      setCompany(userData.company || '');

      // Load notification preferences from the new API endpoint
      try {
        const prefsResponse = await api.get('/auth/notifications');
        if (prefsResponse.data.preferences) {
          setEmailNotifications(prefsResponse.data.preferences.notifyEmail ?? true);
          setFormSubmissions(prefsResponse.data.preferences.notifySubmissions ?? true);
          setWeeklyReports(prefsResponse.data.preferences.notifyWeeklyReports ?? false);
        }
      } catch (prefsError) {
        console.error('Error fetching notification preferences:', prefsError);
        // Fall back to userData preferences if the endpoint doesn't exist yet
        if (userData.preferences) {
          setEmailNotifications(userData.preferences.emailNotifications ?? true);
          setFormSubmissions(userData.preferences.formSubmissions ?? true);
          setWeeklyReports(userData.preferences.weeklyReports ?? false);
        }
      }

      // Load dark mode from localStorage or userData
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode !== null) {
        setDarkMode(savedDarkMode === 'true');
      } else if (userData.preferences?.darkMode !== undefined) {
        setDarkMode(userData.preferences.darkMode);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', { name, email, company });
      // Update local state with new email
      if (response.data.user) {
        setEmail(response.data.user.email);
      }
      showSuccess('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      showSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSave = async () => {
    setSaving(true);
    try {
      // Save notification preferences to the new API endpoint
      await api.put('/auth/notifications', {
        notifyEmail: emailNotifications,
        notifySubmissions: formSubmissions,
        notifyWeeklyReports: weeklyReports,
      });

      // Save dark mode to localStorage
      localStorage.setItem('darkMode', String(darkMode));

      showSuccess('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const response = await api.post('/auth/send-test-email');
      setTestEmailResult({
        success: true,
        message: `Test email sent to ${response.data.email}!`,
        previewUrl: response.data.previewUrl,
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      setTestEmailResult({
        success: false,
        message: error.response?.data?.details || 'Failed to send test email',
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <UserLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 12 }}>
          <CircularProgress sx={{ color: '#1a73e8' }} />
        </Box>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Success Message */}
        {successMessage && (
          <Alert
            icon={<CheckCircleIcon fontSize="inherit" />}
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              animation: 'slideIn 0.3s ease-out',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateY(-20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Tabs Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={(e, newValue) => setTabValue(newValue)}
                  sx={{
                    px: 2,
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      minHeight: 64,
                      transition: 'all 0.3s',
                      '&:hover': {
                        color: '#1a73e8',
                        bgcolor: alpha('#1a73e8', 0.05),
                      },
                      '&.Mui-selected': {
                        color: '#1a73e8',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                    },
                  }}
                >
                  <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
                  <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
                  <Tab icon={<NotificationsIcon />} iconPosition="start" label="Preferences" />
                </Tabs>
              </Box>

              {/* Profile Tab */}
              <TabPanel value={tabValue} index={0}>
                <CardContent sx={{ p: 4 }}>
                  {/* Avatar Section */}
                  <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          fontSize: '3rem',
                          background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                          boxShadow: `0 8px 24px ${alpha('#1a73e8', 0.3)}`,
                          mb: 2,
                        }}
                      >
                        {name ? name[0].toUpperCase() : 'U'}
                      </Avatar>
                      <IconButton
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: -8,
                          bgcolor: 'white',
                          boxShadow: 2,
                          '&:hover': {
                            bgcolor: alpha('#1a73e8', 0.1),
                          },
                        }}
                      >
                        <PhotoCameraIcon sx={{ color: '#1a73e8' }} />
                      </IconButton>
                    </Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                      {name || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {email}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 4 }} />

                  <Box component="form" onSubmit={handleProfileUpdate}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        InputProps={{
                          startAdornment: (
                            <PersonIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                        helperText="You can change your email address here"
                      />
                      <TextField
                        fullWidth
                        label="Company / Organization"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Enter your company name"
                        InputProps={{
                          startAdornment: (
                            <BusinessIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                      />
                      <Box>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<SaveIcon />}
                          disabled={saving}
                          sx={{
                            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: `0 4px 12px ${alpha('#1a73e8', 0.3)}`,
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 16px ${alpha('#1a73e8', 0.4)}`,
                            },
                            '&:disabled': {
                              opacity: 0.6,
                            },
                          }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Security Tab */}
              <TabPanel value={tabValue} index={1}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Change Password
                  </Typography>
                  <Box component="form" onSubmit={handlePasswordChange}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        InputProps={{
                          startAdornment: (
                            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        InputProps={{
                          startAdornment: (
                            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        InputProps={{
                          startAdornment: (
                            <LockIcon sx={{ color: 'text.secondary', mr: 1 }} />
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.1)}`,
                            },
                            '&.Mui-focused': {
                              boxShadow: `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
                            },
                          },
                        }}
                      />
                      <Box>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          startIcon={<LockIcon />}
                          disabled={saving}
                          sx={{
                            background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: `0 4px 12px ${alpha('#1a73e8', 0.3)}`,
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 6px 16px ${alpha('#1a73e8', 0.4)}`,
                            },
                            '&:disabled': {
                              opacity: 0.6,
                            },
                          }}
                        >
                          {saving ? 'Changing...' : 'Change Password'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel value={tabValue} index={2}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Notification Settings
                  </Typography>

                  {/* Test Email Result */}
                  {testEmailResult && (
                    <Alert
                      severity={testEmailResult.success ? 'success' : 'error'}
                      sx={{ mb: 2, borderRadius: 2 }}
                      action={
                        testEmailResult.previewUrl && (
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() => window.open(testEmailResult.previewUrl, '_blank')}
                          >
                            View Email
                          </Button>
                        )
                      }
                    >
                      {testEmailResult.message}
                      {testEmailResult.previewUrl && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          Click "View Email" to see the test email in your browser
                        </Typography>
                      )}
                    </Alert>
                  )}

                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#1a73e8', 0.05),
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha('#1a73e8', 0.08),
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Email Notifications
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive email updates about your account
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={handleSendTestEmail}
                          disabled={sendingTestEmail}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#1a73e8',
                            color: '#1a73e8',
                            '&:hover': {
                              borderColor: '#1557b0',
                              bgcolor: alpha('#1a73e8', 0.05),
                            },
                          }}
                        >
                          {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
                        </Button>
                        <Switch
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#1a73e8',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#1a73e8',
                            },
                          }}
                        />
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#06b6d4', 0.05),
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha('#06b6d4', 0.08),
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Form Submissions
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Get notified when someone submits a form
                        </Typography>
                      </Box>
                      <Switch
                        checked={formSubmissions}
                        onChange={(e) => setFormSubmissions(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#06b6d4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#06b6d4',
                          },
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#4285f4', 0.05),
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha('#4285f4', 0.08),
                        },
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Weekly Reports
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Receive weekly analytics summary
                        </Typography>
                      </Box>
                      <Switch
                        checked={weeklyReports}
                        onChange={(e) => setWeeklyReports(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#4285f4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#4285f4',
                          },
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Display Settings
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#1a73e8', 0.05),
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: alpha('#1a73e8', 0.08),
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Dark Mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Use dark theme across the application
                      </Typography>
                    </Box>
                    <Switch
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#1a73e8',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#1a73e8',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SaveIcon />}
                      disabled={saving}
                      onClick={handlePreferencesSave}
                      sx={{
                        background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: `0 4px 12px ${alpha('#1a73e8', 0.3)}`,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 16px ${alpha('#1a73e8', 0.4)}`,
                        },
                        '&:disabled': {
                          opacity: 0.6,
                        },
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </Box>
                </CardContent>
              </TabPanel>
            </Card>
          </Grid>

          {/* Right Column - Account Info */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3}>
              {/* Account Information Card */}
              <Card
                sx={{
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                    Account Information
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Status
                        </Typography>
                        <Chip
                          label="Active"
                          size="small"
                          icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                          sx={{
                            bgcolor: alpha('#10b981', 0.1),
                            color: '#10b981',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Stack>
                      <Divider />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current Plan
                        </Typography>
                        <Chip
                          label={user?.plan?.name || 'Free'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#1a73e8', 0.1),
                            color: '#1a73e8',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Stack>
                      <Divider />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Member Since
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {new Date(user?.createdAt).toLocaleDateString()}
                        </Typography>
                      </Stack>
                      <Divider />
                    </Box>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Account Type
                        </Typography>
                        <Chip
                          label={user?.role === 'ADMIN' ? 'Admin' : 'User'}
                          size="small"
                          sx={{
                            bgcolor: alpha('#06b6d4', 0.1),
                            color: '#06b6d4',
                            fontWeight: 700,
                            borderRadius: 1.5,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Security Info Card */}
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 24px ${alpha('#1a73e8', 0.4)}`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  },
                }}
              >
                <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <SecurityIcon sx={{ color: 'white', fontSize: 28 }} />
                    <Typography variant="h6" color="white" fontWeight={700}>
                      Security Tips
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Use a strong, unique password
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Change your password regularly
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Enable two-factor authentication
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)' }}>
                      • Keep your API keys secure
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </UserLayout>
  );
};

export default Settings;
