import { useQuery } from '@tanstack/react-query';
import { fetchYouTubeChannelVideos, fetchYouTubeKeywordVideos } from '../lib/api/youtube';
import { useToast } from './useToast';

export function useYouTubeVideos(enabled: boolean = false, type: 'youtube' | 'youtube-search' = 'youtube') {
  const { showToast } = useToast();

  return useQuery({
    queryKey: ['youtubeVideos', type],
    queryFn: async () => {
      try {
        if (type === 'youtube-search') {
          return await fetchYouTubeKeywordVideos();
        } else {
          return await fetchYouTubeChannelVideos();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('quota exceeded')) {
          showToast({
            title: 'YouTube API Limit Reached',
            description: 'YouTube content is temporarily unavailable due to API limits. Please try again tomorrow.',
            variant: 'destructive',
          });
        } else if (errorMessage.includes('rate limit')) {
          showToast({
            title: 'YouTube API Rate Limited',
            description: 'Too many requests. Please wait a moment and try again.',
            variant: 'destructive',
          });
        } else {
          showToast({
            title: 'YouTube Error',
            description: 'Unable to fetch YouTube videos. Please try again later.',
            variant: 'destructive',
          });
        }

        console.error('YouTube API Error:', {
          message: errorMessage,
          timestamp: new Date().toISOString(),
          type
        });

        return [];
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
    retry: (failureCount, error) => {
      // Don't retry on quota exceeded
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000), // Exponential backoff with max 30s
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
