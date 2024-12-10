import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SourceFilter } from './components/source-filter';
import { ThemeToggle } from './components/ThemeToggle';
import { FeedViewer } from './components/FeedViewer';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Main content component
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
          <Route path="/" element={<MainContent />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}
