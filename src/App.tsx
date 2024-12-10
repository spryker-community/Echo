import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { SourceFilter } from './components/source-filter';
import { ThemeToggle } from './components/ThemeToggle';
import { FeedViewer } from './components/FeedViewer';
import { Toaster } from './components/ui/toaster';
import { LoginPage } from './components/auth/LoginPage';
import { ErrorPage } from './components/auth/ErrorPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Auth check component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  const [checkCount, setCheckCount] = React.useState(0);

  React.useEffect(() => {
    // Check for auth cookie
    const checkAuth = () => {
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      console.log('Checking auth, all cookies:', cookies);
      
      const authCookie = cookies.find(cookie => cookie.startsWith('auth='));
      console.log('Found auth cookie:', authCookie);
      
      if (!authCookie) {
        console.log('No auth cookie found, check count:', checkCount);
        if (checkCount < 5) { // Increased from 3 to 5 checks
          // If we haven't checked many times yet, keep checking
          setCheckCount(prev => prev + 1);
          setIsAuthenticated(null);
        } else {
          // After several checks, if still no cookie, consider not authenticated
          setIsAuthenticated(false);
        }
        return;
      }

      // Verify the cookie is valid
      try {
        const token = authCookie.split('=')[1];
        if (!token) {
          console.log('Auth cookie found but empty');
          setIsAuthenticated(false);
          return;
        }
        console.log('Valid auth cookie found');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth cookie:', error);
        setIsAuthenticated(false);
      }
    };

    // Initial check
    checkAuth();

    // If not authenticated and haven't checked many times, check again after a short delay
    const timer = !isAuthenticated && checkCount < 5 ? // Increased from 3 to 5 checks
      setTimeout(checkAuth, 1000) : // Check again after 1 second
      setInterval(checkAuth, 60000); // Regular interval check

    return () => {
      if (!isAuthenticated && checkCount < 5) { // Increased from 3 to 5 checks
        clearTimeout(timer);
      } else {
        clearInterval(timer);
      }
    };
  }, [checkCount, isAuthenticated]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Verify component to handle the magic link verification
function VerifyAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = React.useState('Initializing verification...');
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    async function verifyToken() {
      if (!token) {
        console.log('No token found in URL');
        setVerificationStatus('No token provided');
        navigate('/auth/error', { 
          replace: true,
          state: { message: 'No authentication token provided' }
        });
        return;
      }

      try {
        console.log('Starting token verification');
        setVerificationStatus('Verifying token...');

        const response = await fetch(`/.netlify/functions/auth-verify?token=${encodeURIComponent(token)}`, {
          method: 'GET',
          credentials: 'include',
          redirect: 'follow',
        });

        console.log('Verification response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          url: response.url,
        });

        // Handle 502 error differently as it might still be successful
        if (response.status === 502 && retryCount < 3) {
          console.log('Got 502, waiting before checking auth cookie...');
          setVerificationStatus('Completing authentication...');
          
          // Wait for a moment to allow cookie to be set
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if we have the auth cookie despite the 502
          const cookies = document.cookie.split(';').map(cookie => cookie.trim());
          const authCookie = cookies.find(cookie => cookie.startsWith('auth='));
          
          if (authCookie) {
            console.log('Found auth cookie after 502, proceeding to dashboard');
            navigate('/dashboard', { replace: true });
            return;
          }
          
          // If no cookie found, retry the verification
          setRetryCount(prev => prev + 1);
          setVerificationStatus('Retrying verification...');
          verifyToken();
          return;
        }

        if (response.ok || response.status === 302) {
          setVerificationStatus('Verification successful, redirecting...');
          // Add a small delay to ensure cookie is set
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate('/dashboard', { replace: true });
        } else {
          console.error('Verification failed:', response.status);
          setVerificationStatus('Failed to verify authentication token');
          navigate('/auth/error', { 
            replace: true,
            state: { message: 'Failed to verify authentication token' }
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('Error during verification');
        navigate('/auth/error', { 
          replace: true,
          state: { message: 'Failed to verify authentication token' }
        });
      }
    }

    verifyToken();
  }, [token, navigate, retryCount]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verifying your authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {verificationStatus}
        </p>
      </div>
    </div>
  );
}

// Main content component with existing App content
function MainContent() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear the auth cookie for both domains
    document.cookie = 'auth=; Path=/; Domain=.commercequest.space; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'auth=; Path=/; Domain=echo.commercequest.space; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;';
    
    // Navigate to login
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#011427] transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/images/commercequest.png" alt="Logo" className="w-8 h-8" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Echo</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#EC008C] dark:hover:text-[#EC008C] transition-colors"
            >
              Sign Out
            </button>
            <ThemeToggle />
          </div>
        </header>
        <main className="space-y-8">
          <SourceFilter />
          <FeedViewer />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/error" element={<ErrorPage />} />
          <Route path="/auth/verify" element={<VerifyAuth />} />
          
          {/* Protected dashboard route */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <MainContent />
              </RequireAuth>
            }
          />
          
          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <Navigate to="/dashboard" replace />
              </RequireAuth>
            }
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
