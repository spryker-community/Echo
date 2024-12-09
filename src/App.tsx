import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  const authCookie = document.cookie.includes('auth=');
  
  if (!authCookie) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

// Main content component with existing App content
function MainContent() {
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
              onClick={() => {
                document.cookie = 'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                window.location.href = '/auth/login';
              }}
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
