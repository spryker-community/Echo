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

  React.useEffect(() => {
    // Check for auth cookie
    const checkAuth = () => {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth='));
      
      if (!authCookie) {
        setIsAuthenticated(false);
        return;
      }

      // Verify the cookie is valid
      try {
        const token = authCookie.split('=')[1].trim();
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error checking auth cookie:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    // Set up an interval to check periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

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

  React.useEffect(() => {
    async function verifyToken() {
      try {
        // Pass token as query parameter
        const response = await fetch(`/.netlify/functions/auth-verify?token=${encodeURIComponent(token!)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        // Follow redirect with credentials
        if (response.ok || response.status === 302) {
          const location = response.headers.get('Location');
          if (location) {
            window.location.href = location;
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/auth/error', { 
            replace: true,
            state: { message: 'Failed to verify authentication token' }
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
        navigate('/auth/error', { 
          replace: true,
          state: { message: 'Failed to verify authentication token' }
        });
      }
    }

    if (token) {
      verifyToken();
    } else {
      navigate('/auth/error', { 
        replace: true,
        state: { message: 'No authentication token provided' }
      });
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verifying your authentication...
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please wait while we verify your login.
        </p>
      </div>
    </div>
  );
}

// Main content component with existing App content
function MainContent() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear the auth cookie with all possible domain configurations
    const domain = window.location.hostname;
    const cookieDomain = domain === 'localhost' ? '' : domain;
    
    // Try different cookie clearing approaches
    [
      `auth=; Path=/; ${cookieDomain ? `Domain=${cookieDomain}; ` : ''}Expires=Thu, 01 Jan 1970 00:00:01 GMT;`,
      'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
      `auth=; Path=/; Domain=.${cookieDomain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`,
    ].forEach(cookie => {
      document.cookie = cookie;
    });

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
          
          {/* Protected main route */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <MainContent />
              </RequireAuth>
            }
          />

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
