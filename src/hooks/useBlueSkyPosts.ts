import { useQuery } from '@tanstack/react-query';
import { searchBlueSkyPosts } from '../lib/api/bluesky';
import { ContentItem } from '../types';

export function useBlueSkyPosts(enabled: boolean = false) {
  return useQuery({
    queryKey: ['blueSkyPosts'],
    queryFn: async () => {
      const posts = await searchBlueSkyPosts();
      
      // Convert BlueSky posts to ContentItems
      return posts.map(post => {
        // Create title from first line, or first 100 chars if no newline
        const title = post.record.text.split('\n')[0] || post.record.text.slice(0, 100);
        
        // If post has thread context, append it to description
        let description = post.record.text;
        if (post.threadContext?.parentPost?.text) {
          const parentAuthor = post.threadContext.parentPost.author.displayName || 
                             post.threadContext.parentPost.author.handle;
          description = `${description}\n\nIn reply to ${parentAuthor}:\n${post.threadContext.parentPost.text}`;
        }

        // Only include thread context if parent post text exists
        const threadContext = post.threadContext?.parentPost?.text ? {
          parentPost: {
            text: post.threadContext.parentPost.text,
            author: {
              handle: post.threadContext.parentPost.author.handle,
              displayName: post.threadContext.parentPost.author.displayName
            }
          }
        } : undefined;

        return {
          id: post.uri,
          source: 'bluesky' as const,
          type: 'social' as const,
          title,
          description,
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
            imageCount: post.embed?.images?.length || 0,
            threadContext
          }
        };
      });
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
