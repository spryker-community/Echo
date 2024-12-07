import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SourceProvider } from './context/SourceContext';
import { FeedViewer } from './components/FeedViewer';
import { ThemeToggle } from './components/ThemeToggle';
import { useMessageGeneration } from './hooks/useMessageGeneration';
import { useToast } from './hooks/useToast';
import { ContentItem } from './types';
import { Toaster } from './components/ui/toaster';

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Query/Mutation Error:', error);
      }
    }
  }
});

function AppContent() {
  const { mutate: generateMessage, data: generatedMessage, error: mutationError } = useMessageGeneration();
  const { showToast } = useToast();
  const [lastSourceItem, setLastSourceItem] = useState<ContentItem | null>(null);
  const [generatingForItem, setGeneratingForItem] = useState<ContentItem | null>(null);

  const handleGenerate = async (item: ContentItem) => {
    try {
      // Prevent multiple generations at once
      if (generatingForItem) {
        return;
      }

      console.log('Starting message generation for item:', item);
      setLastSourceItem(item);
      setGeneratingForItem(item);
      
      generateMessage(item, {
        onSuccess: (data) => {
          console.log('Message generation succeeded:', data);
          showToast({
            title: 'Insight Generated 🎉',
            description: 'Your insight is ready to view.',
          });
          setGeneratingForItem(null);
        },
        onError: (error) => {
          console.error('Message generation failed:', error);
          showToast({
            title: 'Generation Failed',
            description: error instanceof Error ? error.message : 'Please try again later.',
            variant: 'destructive',
          });
          setGeneratingForItem(null);
        }
      });
    } catch (error) {
      console.error('Error in handleGenerate:', error);
      showToast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
      setGeneratingForItem(null);
    }
  };

  // Reset generating state if there's an error
  React.useEffect(() => {
    if (mutationError) {
      console.error('Mutation error:', mutationError);
      setGeneratingForItem(null);
    }
  }, [mutationError]);

  // Reset generating state if component unmounts
  React.useEffect(() => {
    return () => {
      setGeneratingForItem(null);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-4 flex justify-between items-center">
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
      
      <main>
        <FeedViewer 
          onGenerate={handleGenerate}
          generatingForItem={generatingForItem}
          generatedMessage={generatedMessage && lastSourceItem ? {
            ...generatedMessage,
            sourceItem: lastSourceItem
          } : undefined}
        />
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 mt-8 border-t dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
