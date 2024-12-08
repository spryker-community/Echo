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

const MAX_RESULTS = 20;

async function fetchYouTubeSearchResults(params: Record<string, string>): Promise<YouTubeVideo[]> {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_TOKEN;

  if (!apiKey) {
    throw new Error('YouTube API token is missing');
  }

  console.log('[YouTube API] Fetching with params:', {
    ...params,
    key: '[REDACTED]'
  });

  const response = await axios.get<{ items: YouTubeVideo[] }>('https://www.googleapis.com/youtube/v3/search', {
    params: {
      key: apiKey,
      part: 'snippet',
      type: 'video',
      maxResults: String(MAX_RESULTS),
      ...params
    }
  });

  if (!response.data?.items) {
    console.warn('[YouTube API] Response missing items:', response.data);
    return [];
  }

  console.log(`[YouTube API] Fetched ${response.data.items.length} videos`);
  return response.data.items;
}

export async function fetchYouTubeChannelVideos(): Promise<ContentItem[]> {
  try {
    const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;

    if (!channelId) {
      console.error('[YouTube API] Channel ID is missing');
      throw new Error('YouTube Channel ID is missing');
    }

    console.log('[YouTube API] Fetching channel videos:', channelId);

    const videos = await fetchYouTubeSearchResults({
      channelId,
      order: 'date'
    });

    const items = videos
      .slice(0, MAX_RESULTS)
      .map(video => processYouTubeVideo(video, 'youtube'));

    console.log(`[YouTube API] Processed ${items.length} channel videos`);
    return items;
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
      console.error('[YouTube API] Search keywords are missing');
      throw new Error('YouTube search keywords are missing');
    }

    // Split keywords and create individual searches
    const keywordList: string[] = keywords.split(',').map((k: string) => k.trim());
    console.log('[YouTube API] Using keywords:', keywordList);

    // Search for each keyword separately
    const searchPromises = keywordList.map(keyword => 
      fetchYouTubeSearchResults({
        q: keyword,
        order: 'relevance',
        publishedAfter: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString() // Last year
      })
    );

    const searchResults = await Promise.all(searchPromises);
    const allVideos = searchResults.flat();
    console.log(`[YouTube API] Total videos fetched: ${allVideos.length}`);

    // Remove duplicates and exclude own channel
    const seenIds = new Set<string>();
    const filteredVideos = allVideos
      .filter(video => {
        // Skip if we've seen this video
        if (seenIds.has(video.id.videoId)) {
          console.log('[YouTube API] Skipping duplicate video:', video.snippet.title);
          return false;
        }
        seenIds.add(video.id.videoId);

        // Skip if it's from our channel
        if (video.snippet.channelId === ownChannelId) {
          console.log('[YouTube API] Excluding own video:', video.snippet.title);
          return false;
        }

        console.log('[YouTube API] Including video:', {
          title: video.snippet.title,
          channel: video.snippet.channelTitle
        });
        return true;
      })
      .slice(0, MAX_RESULTS); // Limit to max results after filtering

    console.log(`[YouTube API] Found ${filteredVideos.length} videos`);

    const items = filteredVideos.map(video => processYouTubeVideo(video, 'youtube-search'));
    console.log(`[YouTube API] Processed ${items.length} search videos`);
    return items;
  } catch (error) {
    handleYouTubeError(error);
    return [];
  }
}

function processYouTubeVideo(video: YouTubeVideo, source: 'youtube' | 'youtube-search'): ContentItem {
  console.log('[YouTube API] Processing video:', {
    title: video.snippet.title,
    channel: video.snippet.channelTitle,
    source
  });

  const decodedTitle = decodeHtmlEntities(video.snippet.title);

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
      console.error('[YouTube API] Quota exceeded');
      throw new Error('YouTube API quota exceeded. Please try again later.');
    }

    console.error('[YouTube API] Error:', {
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

  console.error('[YouTube API] Unexpected error:', error);
  throw new Error('An unexpected error occurred while fetching YouTube videos');
}
