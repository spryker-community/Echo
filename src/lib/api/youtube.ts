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
  channelId: string;
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

async function fetchYouTubeSearchResults(params: Record<string, string>): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_TOKEN;

  if (!apiKey) {
    throw new Error('YouTube API token is missing');
  }

  const response = await axios.get<{ items: YouTubeVideo[] }>('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: apiKey,
      part: 'snippet',
      type: 'video',
      maxResults: '10',
      ...params
    }
  });

  if (!response.data?.items) {
    console.warn('YouTube API response missing items:', response.data);
    return [];
  }

  return response.data.items;
}

export async function fetchYouTubeChannelVideos(): Promise<ContentItem[]> {
  try {
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!channelId) {
      console.error('YouTube Channel ID is missing');
      throw new Error('YouTube Channel ID is missing');
    }

    console.log('Fetching YouTube videos for channel:', channelId);

    const videos = await fetchYouTubeSearchResults({
      channelId,
      order: 'date'
    });

    return videos.map(video => processYouTubeVideo(video, 'youtube'));
  } catch (error) {
    handleYouTubeError(error);
    return [];
  }
}

export async function fetchYouTubeKeywordVideos(): Promise<ContentItem[]> {
  try {
    const keywords = import.meta.env.VITE_YOUTUBE_KEYWORDS;
    const ownChannelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!keywords) {
      console.error('YouTube search keywords are missing');
      throw new Error('YouTube search keywords are missing');
    }

    console.log('Fetching YouTube videos for keywords:', keywords);

    const videos = await fetchYouTubeSearchResults({
      q: keywords,
      order: 'relevance'
    });

    // Filter out videos from our own channel
    return videos
      .filter(video => video.snippet.channelId !== ownChannelId)
      .map(video => processYouTubeVideo(video, 'youtube-search'));
  } catch (error) {
    handleYouTubeError(error);
    return [];
  }
}

function processYouTubeVideo(video: YouTubeVideo, source: 'youtube' | 'youtube-search'): ContentItem {
  // Log raw title for debugging
  console.log('Raw YouTube title:', video.snippet.title);
  const decodedTitle = decodeHtmlEntities(video.snippet.title);
  console.log('Decoded YouTube title:', decodedTitle);

  return {
    id: video.id.videoId,
    source,
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
      channelId: video.snippet.channelId,
      thumbnails: video.snippet.thumbnails,
    },
  };
}

function handleYouTubeError(error: unknown): never {
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
