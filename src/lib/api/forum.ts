import axios from 'axios';
import { ContentItem } from '../../types';

const forumApi = axios.create({
  baseURL: import.meta.env.VITE_FORUM_API_URL,
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_FORUM_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function fetchForumPosts(): Promise<ContentItem[]> {
  try {
    console.log('[FORUM API] Fetching forum posts with URL:', import.meta.env.VITE_FORUM_API_URL);
    const response = await forumApi.get('/api/v2/discussions');
    
    console.log('[FORUM API] Raw Response:', JSON.stringify({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      dataType: typeof response.data,
      dataKeys: Object.keys(response.data || {}),
      firstItemKeys: response.data && response.data.length > 0 ? Object.keys(response.data[0]) : 'No items'
    }, null, 2));

    // Ensure we're processing the correct part of the response
    const discussions = response.data || [];

    console.log(`[FORUM API] Number of discussions: ${discussions.length}`);

    const processedPosts = discussions.map((post: any): ContentItem => {
      const processedPost = {
        id: post.discussionID.toString(),
        source: 'vanilla-forum',
        type: 'forum' as const,
        title: post.name,
        description: post.body?.replace(/<[^>]*>/g, '').slice(0, 200) + '...', // Strip HTML and limit length
        url: `${import.meta.env.VITE_FORUM_API_URL}/discussion/${post.discussionID}`,
        date: post.dateInserted,
        image: post.image?.url,
        metadata: {
          categoryID: post.categoryID,
          score: post.score,
          countComments: post.countComments,
        },
      };

      console.log('[FORUM API] Processed Post:', JSON.stringify(processedPost, null, 2));
      return processedPost;
    });

    return processedPosts;
  } catch (error) {
    console.log('[FORUM API] Error fetching forum posts:', error);
    if (axios.isAxiosError(error)) {
      console.log('[FORUM API] Detailed Error:', JSON.stringify({
        data: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          params: error.config?.params,
          headers: {
            ...error.config?.headers,
            'Authorization': '[REDACTED]'
          }
        }
      }, null, 2));
    }
    throw error;
  }
}
