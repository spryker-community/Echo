import { useQuery } from '@tanstack/react-query';
import { ContentItem } from '../types';
import { fetchDiscussions } from '../lib/api/forum';

// Get category name based on categoryID
function getCategoryName(categoryId: number): string {
  const categories: Record<number, string> = {
    47: 'Installation & Setup',
    48: 'Development',
    58: 'Jobs',
    60: 'Troubleshooting',
    64: 'Best Practices',
    35: 'News & Announcements'
  };
  return categories[categoryId] || 'General Discussion';
}

export function useForumPosts(enabled: boolean = false) {
  return useQuery({
    queryKey: ['forumPosts'],
    queryFn: async () => {
      const discussions = await fetchDiscussions();

      return discussions.map(discussion => {
        // Log raw data for debugging
        console.log('[FORUM API] Raw discussion data:', {
          title: discussion.name,
          categoryId: discussion.categoryID,
          comments: discussion.countComments,
          lastActivity: discussion.dateLastComment,
          status: discussion.status,
          type: discussion.type
        });

        const post: ContentItem = {
          id: String(discussion.discussionID),
          source: 'vanilla-forum',
          type: 'forum',
          title: discussion.name,
          description: discussion.body,
          url: `${import.meta.env.VITE_FORUM_API_URL}/discussion/${discussion.discussionID}`,
          date: discussion.dateInserted,
          metadata: {
            categoryID: discussion.categoryID,
            categoryName: getCategoryName(discussion.categoryID),
            categoryUrl: `${import.meta.env.VITE_FORUM_API_URL}/categories/${discussion.categoryID}`,
            score: discussion.score,
            countComments: discussion.countComments,
            dateLastComment: discussion.dateLastComment,
            status: discussion.status,
            type: discussion.type,
            insertUser: discussion.insertUser && {
              name: discussion.insertUser.name,
              photoUrl: discussion.insertUser.photoUrl,
              url: `${import.meta.env.VITE_FORUM_API_URL}/profile/${encodeURIComponent(discussion.insertUser.name)}`
            }
          }
        };

        console.log('[FORUM API] Processed Post:', {
          id: post.id,
          title: post.title,
          category: post.metadata.categoryName,
          author: post.metadata.insertUser?.name,
          comments: post.metadata.countComments,
          lastActivity: post.metadata.dateLastComment,
          status: post.metadata.status,
          type: post.metadata.type
        });

        return post;
      });
    },
    enabled: enabled,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('403')) {
          return false;
        }
      }
      return failureCount < 2;
    }
  });
}
