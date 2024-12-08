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

// Get RSS feed configurations
const rssFeeds = [
  {
    id: 'rss-feed-1',
    name: import.meta.env.VITE_RSS_FEED_1_NAME,
    url: import.meta.env.VITE_RSS_FEED_1_URL,
  },
  {
    id: 'rss-feed-2',
    name: import.meta.env.VITE_RSS_FEED_2_NAME,
    url: import.meta.env.VITE_RSS_FEED_2_URL,
  },
  {
    id: 'rss-feed-3',
    name: import.meta.env.VITE_RSS_FEED_3_NAME,
    url: import.meta.env.VITE_RSS_FEED_3_URL,
  }
].filter(feed => feed.url && feed.name);

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
    enabled: false, // YouTube channel disabled by default
  },
  {
    id: 'youtube-search',
    type: 'youtube-search',
    url: getYouTubeSearchUrl(),
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: false, // YouTube search disabled by default
  },
  {
    id: 'bluesky',
    type: 'social',
    url: getBlueSkyUrl(),
    apiKey: import.meta.env.VITE_BLUESKY_APP_PASSWORD,
    enabled: true,
  },
  // Add individual RSS feeds as separate sources
  ...rssFeeds.map(feed => ({
    id: feed.id,
    type: 'rss',
    name: feed.name,
    url: feed.url,
    enabled: true,
  }))
];
