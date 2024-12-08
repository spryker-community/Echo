import { useQuery } from '@tanstack/react-query';
import { fetchYouTubeVideos } from '../lib/api/youtube';
import { useToast } from './useToast';

export function useYouTubeVideos(enabled: boolean = false) {
  const { showToast } = useToast();

  return useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: async () => {
      try {
        return await fetchYouTubeVideos();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
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

        console.error('YouTube API Error:', {
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });

        return [];
      }
    },
    enabled: enabled, // Only fetch when enabled
    staleTime: Infinity, // Keep data fresh forever until manual refresh
    gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (renamed from cacheTime in v5)
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount
  });
}
