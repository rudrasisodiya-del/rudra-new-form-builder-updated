import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { createAppTheme } from './theme';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Import styles
import './index.css';

// Eager load only critical pages for initial render
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Lazy load all other pages for better performance
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const MyForms = lazy(() => import('./pages/user/MyForms'));
const FormBuilderPage = lazy(() => import('./pages/user/FormBuilder'));
const FormTypeSelection = lazy(() => import('./pages/user/FormTypeSelection'));
const TemplateLibrary = lazy(() => import('./pages/user/TemplateLibrary'));
const AIFormGenerator = lazy(() => import('./pages/user/AIFormGenerator'));
const Submissions = lazy(() => import('./pages/user/Submissions'));
const Analytics = lazy(() => import('./pages/user/Analytics'));
const Share = lazy(() => import('./pages/user/Share'));
const Settings = lazy(() => import('./pages/user/Settings'));
const Integration = lazy(() => import('./pages/user/Integration'));
const APIKeys = lazy(() => import('./pages/user/APIKeys'));
const Webhooks = lazy(() => import('./pages/user/Webhooks'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PublicFormView = lazy(() => import('./pages/PublicFormView'));
const PublicFormViewWithPayment = lazy(() => import('./pages/PublicFormViewWithPayment'));
const AIChatbot = lazy(() => import('./components/AIChatbot'));
const PaymentFormBuilder = lazy(() => import('./pages/user/PaymentFormBuilder'));
const PDFFormConverter = lazy(() => import('./pages/user/PDFFormConverter'));
const ESignFormBuilder = lazy(() => import('./pages/user/ESignFormBuilder'));
const ImportForm = lazy(() => import('./pages/user/ImportForm'));
const TestFeaturesPage = lazy(() => import('./pages/user/TestFeaturesPage'));
const HelpPage = lazy(() => import('./pages/user/HelpPage'));
const ApiDocumentation = lazy(() => import('./pages/user/ApiDocumentation'));

// Loading component
const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress size={50} thickness={4} />
  </Box>
);

function AppContent() {
  // Initialize authentication state from localStorage immediately
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const { isDarkMode } = useTheme();
  const theme = useMemo(() => createAppTheme(isDarkMode ? 'dark' : 'light'), [isDarkMode]);

  useEffect(() => {
    // Double-check token on mount
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forms/:id" element={<PublicFormViewWithPayment />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms"
              element={isAuthenticated ? <MyForms /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/create"
              element={isAuthenticated ? <FormTypeSelection /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/templates"
              element={isAuthenticated ? <TemplateLibrary /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/ai-generator"
              element={isAuthenticated ? <AIFormGenerator /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/payment"
              element={isAuthenticated ? <PaymentFormBuilder /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/pdf-converter"
              element={isAuthenticated ? <PDFFormConverter /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/esign"
              element={isAuthenticated ? <ESignFormBuilder /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/import"
              element={isAuthenticated ? <ImportForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/test-features"
              element={isAuthenticated ? <TestFeaturesPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/forms/builder/:id?"
              element={isAuthenticated ? <FormBuilderPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/submissions"
              element={isAuthenticated ? <Submissions /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/submissions/:id"
              element={isAuthenticated ? <Submissions /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/analytics"
              element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/share"
              element={isAuthenticated ? <Share /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/settings"
              element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/help"
              element={isAuthenticated ? <HelpPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/integration"
              element={isAuthenticated ? <Integration /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/api-keys"
              element={isAuthenticated ? <APIKeys /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/webhooks"
              element={isAuthenticated ? <Webhooks /> : <Navigate to="/login" />}
            />
            <Route
              path="/dashboard/api-docs"
              element={isAuthenticated ? <ApiDocumentation /> : <Navigate to="/login" />}
            />
          </Routes>

          {/* AI Chatbot - Available on all pages */}
          <AIChatbot />
        </Suspense>
      </Router>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
