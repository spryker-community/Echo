import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ContentItem } from '../types';
import { decodeHtmlEntities } from '../lib/utils';

interface ForumDiscussion {
  discussionID: string;
  name: string;
  body: string;
  dateInserted: string;
  image?: string;
  categoryID: number;
  score: number;
  countComments: number;
}

interface ForumApiResponse {
  data: ForumDiscussion[];
  status: number;
  statusText: string;
}

async function fetchForumPosts(): Promise<ContentItem[]> {
  try {
    console.log('[FORUM API] Fetching forum posts with URL:', import.meta.env.VITE_FORUM_API_URL);
    
    const response = await axios.get<ForumDiscussion[]>(import.meta.env.VITE_FORUM_API_URL + '/api/v2/discussions', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_FORUM_API_KEY}`
      }
    });

    console.log('[FORUM API] Raw Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : null,
      firstItemKeys: response.data?.[0] ? Object.keys(response.data[0]) : null
    });

    if (!Array.isArray(response.data)) {
      console.error('[FORUM API] Unexpected response format:', response.data);
      return [];
    }

    console.log('[FORUM API] Number of discussions:', response.data.length);

    return response.data.map(discussion => {
      // Log raw title for debugging
      console.log('[FORUM API] Raw title:', discussion.name);
      
      const decodedTitle = decodeHtmlEntities(discussion.name);
      console.log('[FORUM API] Decoded title:', decodedTitle);

      // Strip HTML tags and decode entities from body
      const strippedBody = discussion.body?.replace(/<[^>]*>/g, '') || '';
      const decodedBody = decodeHtmlEntities(strippedBody);

      const post: ContentItem = {
        id: String(discussion.discussionID),
        source: 'vanilla-forum',
        type: 'forum',
        title: decodedTitle,
        description: decodedBody,
        url: `${import.meta.env.VITE_FORUM_API_URL}/discussion/${discussion.discussionID}`,
        date: discussion.dateInserted,
        image: discussion.image,
        metadata: {
          categoryID: discussion.categoryID,
          score: discussion.score,
          countComments: discussion.countComments
        }
      };

      console.log('[FORUM API] Processed Post:', {
        id: post.id,
        title: post.title,
        descriptionLength: post.description.length,
        hasImage: !!post.image
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
    gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (renamed from cacheTime in v5)
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
