import axios, { AxiosError } from 'axios';
import { ContentItem } from '../../types';

const youtubeApi = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3',
  params: {
    key: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    channelId: import.meta.env.VITE_YOUTUBE_CHANNEL_ID,
    part: 'snippet',
    order: 'date',
    maxResults: 10,
  },
});

export async function fetchYouTubeVideos(): Promise<ContentItem[]> {
  try {
    // Log the API configuration (without sensitive data)
    console.log('Fetching YouTube videos with config:', {
      channelId: import.meta.env.VITE_YOUTUBE_CHANNEL_ID,
      baseURL: youtubeApi.defaults.baseURL,
      params: {
        ...youtubeApi.defaults.params,
        key: '[REDACTED]'
      }
    });

    const response = await youtubeApi.get('/search', {
      params: {
        type: 'video',
      },
    });

    if (!response.data.items) {
      console.error('YouTube API response missing items:', response.data);
      return [];
    }

    return response.data.items.map((video: any) => {
      // Log each video's thumbnail data for debugging
      console.log('Video thumbnails:', video.snippet.thumbnails);
      
      return {
        id: video.id.videoId,
        source: 'youtube',
        type: 'youtube',
        title: video.snippet.title,
        description: video.snippet.description,
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        date: video.snippet.publishedAt,
        // Ensure we're getting the highest quality thumbnail available
        image: video.snippet.thumbnails?.maxres?.url || 
               video.snippet.thumbnails?.high?.url || 
               video.snippet.thumbnails?.medium?.url || 
               video.snippet.thumbnails?.default?.url,
        metadata: {
          channelTitle: video.snippet.channelTitle,
          thumbnails: video.snippet.thumbnails,
        },
      };
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('YouTube API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          params: error.config?.params,
          baseURL: error.config?.baseURL,
        }
      });
    } else {
      console.error('Unexpected error fetching YouTube videos:', error);
    }
    throw error;
  }
}
