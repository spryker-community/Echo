import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SourceFilter } from './components/source-filter';
import { ThemeToggle } from './components/ThemeToggle';
import { FeedViewer } from './components/FeedViewer';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/useToast';
import { LogOut } from 'lucide-react';

// Password protection component
function RequirePassword({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  if (!isAuthenticated) {
    return <PasswordPage onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}

// Password page component
function PasswordPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password === import.meta.env.VITE_ACCESS_PASSWORD) {
        localStorage.setItem('isAuthenticated', 'true');
        onAuthenticated();
      } else {
        showToast({
          title: "Access Denied",
          description: "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      showToast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setPassword(''); // Clear password field after attempt
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#011427]">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <img
            src="/images/commercequest.png"
            alt="CommerceQuest Logo"
            className="mx-auto h-24 w-auto mb-8"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Community Echo
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please enter the password to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-[#00AEEF] focus:border-[#00AEEF] focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
              placeholder="Enter password"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#00AEEF] hover:bg-[#EC008C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00AEEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Enter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main content component
function MainContent() {
  const { showToast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    showToast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#011427] transition-colors">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <img src="/images/commercequest.png" alt="Logo" className="w-8 h-8" />
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community Echo</h1>
              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium tracking-wider
                           bg-gradient-to-r from-[#00AEEF]/5 via-[#00AEEF]/8 to-[#00AEEF]/10 
                           dark:from-[#00AEEF]/10 dark:via-[#00AEEF]/15 dark:to-[#00AEEF]/20 
                           text-[#00AEEF]/80 dark:text-[#00AEEF]/80
                           border border-[#00AEEF]/10 dark:border-[#00AEEF]/20
                           rounded-md uppercase translate-y-[2px]">
                Beta
              </span>
            </div>
          </div>
          <div className="flex items-center -my-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                       text-gray-500 hover:text-[#EC008C] 
                       dark:text-gray-400 dark:hover:text-[#EC008C] 
                       hover:bg-gray-100/50 dark:hover:bg-gray-800/50
                       transition-all duration-200"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-1.5 text-sm font-medium">Logout</span>
            </button>
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
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <RequirePassword>
              <MainContent />
            </RequirePassword>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}
