import { useQuery } from '@tanstack/react-query';
import { searchBlueSkyPosts } from '../lib/api/bluesky';
import { ContentItem } from '../types';

export function useBlueSkyPosts(enabled: boolean = false) {
  return useQuery({
    queryKey: ['blueSkyPosts'],
    queryFn: async () => {
      const posts = await searchBlueSkyPosts();
      
      // Convert BlueSky posts to ContentItems
      return posts.map(post => ({
        id: post.uri,
        source: 'bluesky' as const,
        type: 'social' as const, // Explicitly type as 'social'
        title: post.record.text.split('\n')[0], // First line as title
        description: post.record.text,
        url: `https://bsky.app/profile/${post.author.handle}/post/${post.uri.split('/').pop()}`,
        date: post.record.createdAt,
        image: post.embed?.images?.[0]?.fullsize,
        metadata: {
          author: {
            name: post.author.displayName || post.author.handle,
            handle: post.author.handle,
            avatar: post.author.avatar
          },
          hasImages: !!post.embed?.images?.length,
          imageCount: post.embed?.images?.length || 0
        }
      }));
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error instanceof Error && error.message.includes('authenticate')) {
        return false;
      }
      return failureCount < 2;
    }
  });
}
