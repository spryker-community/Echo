import { SourceConfig } from '../types';

function getYouTubeUrl(): string {
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    console.error('YouTube Channel ID is missing');
    return '';
  }
  return `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}`;
}

function getYouTubeSearchUrl(): string {
  const keywords = import.meta.env.VITE_YOUTUBE_KEYWORDS;
  if (!keywords) {
    console.error('YouTube search keywords are missing');
    return '';
  }
  return `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(keywords)}`;
}

function getForumUrl(): string {
  const url = import.meta.env.VITE_FORUM_API_URL;
  if (!url) {
    console.error('Forum API URL is missing');
    return '';
  }
  return url;
}

function getBlueSkyUrl(): string {
  const identifier = import.meta.env.VITE_BLUESKY_IDENTIFIER;
  if (!identifier) {
    console.error('BlueSky identifier is missing');
    return '';
  }
  return `https://bsky.social/xrpc/app.bsky.feed.searchPosts`;
}

export const defaultSources: SourceConfig[] = [
  {
    id: 'vanilla-forum',
    type: 'forum',
    url: getForumUrl(),
    apiKey: import.meta.env.VITE_FORUM_API_KEY,
    enabled: true,
  },
  {
    id: 'youtube',
    type: 'youtube',
    url: getYouTubeUrl(),
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: true,
  },
  {
    id: 'youtube-search',
    type: 'youtube-search',
    url: getYouTubeSearchUrl(),
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: true,
  },
  {
    id: 'bluesky',
    type: 'social',
    url: getBlueSkyUrl(),
    apiKey: import.meta.env.VITE_BLUESKY_APP_PASSWORD,
    enabled: true,
  }
];
