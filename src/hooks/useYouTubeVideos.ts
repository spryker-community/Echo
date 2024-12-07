import { useQuery } from '@tanstack/react-query';
import { fetchYouTubeVideos } from '../lib/api/youtube';
import { useToast } from './useToast';

export function useYouTubeVideos() {
  const { showToast } = useToast();

  return useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: async () => {
      try {
        return await fetchYouTubeVideos();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Check for quota exceeded error
        if (errorMessage.includes('quota exceeded')) {
          showToast({
            title: 'YouTube API Limit Reached',
            description: 'YouTube content is temporarily unavailable due to API limits. Please try again later.',
            variant: 'destructive',
          });
        } else {
          showToast({
            title: 'YouTube Error',
            description: 'Unable to fetch YouTube videos. Please try again later.',
            variant: 'destructive',
          });
        }

        // Log the error for debugging
        console.error('YouTube API Error:', {
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });

        // Return empty array to prevent app from breaking
        return [];
      }
    },
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: (failureCount, error) => {
      // Don't retry if quota is exceeded
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    // Disable background refetching when quota is exceeded
    refetchOnWindowFocus: (query) => {
      if (query.state.error instanceof Error && 
          query.state.error.message.includes('quota exceeded')) {
        return false;
      }
      return true;
    }
  });
}
