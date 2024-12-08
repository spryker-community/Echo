import axios, { AxiosError } from 'axios';
import { ContentItem } from '../../types';
import { decodeHtmlEntities } from '../utils';

interface YouTubeApiError {
  error?: {
    code?: number;
    message?: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

interface YouTubeSnippet {
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    maxres?: { url: string };
  };
}

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: YouTubeSnippet;
}

export async function fetchYouTubeVideos(): Promise<ContentItem[]> {
  try {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_TOKEN;
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      console.error('YouTube API configuration missing:', {
        hasApiKey: !!apiKey,
        hasChannelId: !!channelId
      });
      throw new Error('YouTube API configuration is incomplete');
    }

    console.log('Fetching YouTube videos for channel:', channelId);

    const response = await axios.get<{ items: YouTubeVideo[] }>('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: apiKey,
        channelId: channelId,
        part: 'snippet',
        order: 'date',
        maxResults: 10,
        type: 'video'
      }
    });

    if (!response.data?.items) {
      console.warn('YouTube API response missing items:', response.data);
      return [];
    }

    return response.data.items.map((video) => {
      // Log raw title for debugging
      console.log('Raw YouTube title:', video.snippet.title);
      
      const decodedTitle = decodeHtmlEntities(video.snippet.title);
      console.log('Decoded YouTube title:', decodedTitle);

      return {
        id: video.id.videoId,
        source: 'youtube',
        type: 'youtube',
        title: decodedTitle,
        description: decodeHtmlEntities(video.snippet.description),
        url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        date: video.snippet.publishedAt,
        image: video.snippet.thumbnails?.maxres?.url || 
               video.snippet.thumbnails?.high?.url || 
               video.snippet.thumbnails?.medium?.url || 
               video.snippet.thumbnails?.default?.url,
        metadata: {
          channelTitle: decodeHtmlEntities(video.snippet.channelTitle),
          thumbnails: video.snippet.thumbnails,
        },
      };
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      const youtubeError = error.response?.data as YouTubeApiError;
      
      // Check for quota exceeded error
      if (youtubeError?.error?.errors?.some(e => e.reason === 'quotaExceeded')) {
        console.error('YouTube API quota exceeded. Please try again later.');
        throw new Error('YouTube API quota exceeded. Please try again later.');
      }

      console.error('YouTube API Error:', {
        status: error.response?.status,
        message: youtubeError?.error?.message || error.message,
        errors: youtubeError?.error?.errors,
        config: {
          url: error.config?.url,
          params: {
            ...error.config?.params,
            key: '[REDACTED]'
          }
        }
      });

      throw new Error('Failed to fetch YouTube videos. Please try again later.');
    }

    console.error('Unexpected error fetching YouTube videos:', error);
    throw new Error('An unexpected error occurred while fetching YouTube videos');
  }
}
