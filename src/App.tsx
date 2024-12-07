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
            <span className="text-3xl">🌐</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Community Echo
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="https://github.com/your-repo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
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
