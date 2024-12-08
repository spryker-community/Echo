import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SourceProvider } from './context/SourceContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { HiddenProvider } from './context/HiddenContext';
import { Toaster } from './components/ui/toaster';
import { FeedViewer } from './components/FeedViewer';
import { SourceFilter } from './components/SourceFilter';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SourceProvider>
            <HiddenProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <img src="/images/commercequest.png" alt="Logo" className="w-8 h-8" />
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Community Echo
                      </h1>
                    </div>
                    <ThemeToggle />
                  </header>
                  <main className="space-y-8">
                    <SourceFilter />
                    <FeedViewer />
                  </main>
                </div>
              </div>
              <Toaster />
            </HiddenProvider>
          </SourceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
