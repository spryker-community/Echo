import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SourceProvider } from './context/SourceContext';
import { FeedViewer } from './components/FeedViewer';
import { GeneratedMessage } from './components/GeneratedMessage';
import { ThemeToggle } from './components/ThemeToggle';
import { useMessageGeneration } from './hooks/useMessageGeneration';
import { useToast } from './hooks/useToast';
import { ContentItem } from './types';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient();

function AppContent() {
  const { mutate: generateMessage, data: generatedMessage } = useMessageGeneration();
  const { showToast } = useToast();
  const [lastSourceItem, setLastSourceItem] = useState<ContentItem | null>(null);

  const handleGenerate = (item: ContentItem) => {
    setLastSourceItem(item);
    generateMessage(item, {
      onSuccess: () => {
        showToast({
          title: 'Message Generated 🎉',
          description: 'Your insightful message is ready to be shared.',
        });
      },
      onError: () => {
        showToast({
          title: 'Generation Failed 😔',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleCopy = () => {
    if (generatedMessage?.content) {
      navigator.clipboard.writeText(generatedMessage.content);
      showToast({
        title: 'Copied to Clipboard 📋',
        description: 'Message is now in your clipboard.',
      });
    }
  };

  const handleRegenerate = () => {
    if (lastSourceItem) {
      generateMessage(lastSourceItem);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src="/images/commercequest.png" 
              alt="Community Echo"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Community Echo
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FeedViewer onGenerate={handleGenerate} />
        
        {generatedMessage && (
          <div className="mt-8">
            <GeneratedMessage
              content={generatedMessage.content}
              targetAudiences={generatedMessage.targetAudiences}
              onCopy={handleCopy}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 mt-8 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Community Echo. Powered by AI and Community Insights.
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <SourceProvider>
            <AppContent />
          </SourceProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
