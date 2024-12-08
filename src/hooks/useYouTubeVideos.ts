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
          type
        });

        return [];
      }
    },
    enabled: enabled,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
