import { useQuery } from '@tanstack/react-query';
import { fetchYouTubeVideos } from '../lib/api/youtube';

export function useYouTubeVideos() {
  return useQuery({
    queryKey: ['youtubeVideos'],
    queryFn: fetchYouTubeVideos,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
}