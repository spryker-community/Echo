import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ContentItem } from '../types';
import { decodeHtmlEntities } from '../lib/utils';

interface ForumUser {
  userID: string;
  name: string;
  photoUrl?: string;
  email?: string;
}

interface ForumDiscussion {
  discussionID: string;
  name: string;
  body: string;
  dateInserted: string;
  dateLastComment?: string;
  image?: string;
  categoryID: number;
  score: number;
  countComments: number;
  insertUserID: string;
  insertUser: {
    name: string;
    photoUrl?: string;
    email?: string;
  };
  lastUserID?: string;
  lastUser?: {
    name: string;
    photoUrl?: string;
  };
  url?: string;
  format: string;
}

async function fetchForumPosts(): Promise<ContentItem[]> {
  try {
    console.log('[FORUM API] Fetching forum posts with URL:', import.meta.env.VITE_FORUM_API_URL);
    
    const response = await axios.get<ForumDiscussion[]>(
      `${import.meta.env.VITE_FORUM_API_URL}/api/v2/discussions`, 
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_FORUM_API_KEY}`
        }
      }
    );

    const discussions = response.data;

    if (!Array.isArray(discussions)) {
      console.error('[FORUM API] Unexpected response format:', discussions);
      return [];
    }

    console.log('[FORUM API] Number of discussions:', discussions.length);

    return discussions.map(discussion => {
      // Log raw data for debugging
      console.log('[FORUM API] Raw discussion data:', {
        title: discussion.name,
        author: discussion.insertUser?.name,
        comments: discussion.countComments,
        lastActivity: discussion.dateLastComment
      });
      
      const decodedTitle = decodeHtmlEntities(discussion.name);
      
      // Strip HTML tags and decode entities from body
      const strippedBody = discussion.body?.replace(/<[^>]*>/g, '') || '';
      const decodedBody = decodeHtmlEntities(strippedBody);

      // Get category name based on categoryID
      const getCategoryName = (categoryId: number) => {
        const categories: Record<number, string> = {
          47: 'Installation & Setup',
          48: 'Development',
          58: 'Jobs',
          60: 'Troubleshooting',
          64: 'Best Practices',
          35: 'News & Announcements'
        };
        return categories[categoryId] || 'General Discussion';
      };

      const post: ContentItem = {
        id: String(discussion.discussionID),
        source: 'vanilla-forum',
        type: 'forum',
        title: decodedTitle,
        description: decodedBody,
        url: discussion.url || `${import.meta.env.VITE_FORUM_API_URL}/discussion/${discussion.discussionID}`,
        date: discussion.dateInserted,
        image: discussion.image,
        metadata: {
          categoryID: discussion.categoryID,
          categoryName: getCategoryName(discussion.categoryID),
          categoryUrl: `${import.meta.env.VITE_FORUM_API_URL}/categories/${discussion.categoryID}`,
          score: discussion.score,
          countComments: discussion.countComments,
          format: discussion.format,
          dateLastComment: discussion.dateLastComment,
          insertUser: discussion.insertUser && {
            name: decodeHtmlEntities(discussion.insertUser.name),
            photoUrl: discussion.insertUser.photoUrl,
            url: `${import.meta.env.VITE_FORUM_API_URL}/profile/${encodeURIComponent(discussion.insertUser.name)}`
          },
          lastUser: discussion.lastUser && {
            name: decodeHtmlEntities(discussion.lastUser.name),
            photoUrl: discussion.lastUser.photoUrl,
            url: `${import.meta.env.VITE_FORUM_API_URL}/profile/${encodeURIComponent(discussion.lastUser.name)}`
          }
        }
      };

      console.log('[FORUM API] Processed Post:', {
        id: post.id,
        title: post.title,
        category: post.metadata.categoryName,
        author: post.metadata.insertUser?.name,
        comments: post.metadata.countComments
      });

      return post;
    });
  } catch (error) {
    console.error('[FORUM API] Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    });
    throw error;
  }
}

export function useForumPosts(enabled: boolean = false) {
  return useQuery({
    queryKey: ['forumPosts'],
    queryFn: fetchForumPosts,
    enabled: enabled, // Only fetch when enabled
    staleTime: Infinity, // Keep data fresh forever until manual refresh
    gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch on mount
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof axios.AxiosError) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          return false;
        }
      }
      return failureCount < 2;
    }
  });
}
