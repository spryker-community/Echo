import { SourceConfig } from '../types';

function getYouTubeUrl(): string | null {
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    console.error('YouTube Channel ID is missing');
    return null;
  }
  return `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}`;
}

function getYouTubeSearchUrl(): string | null {
  const keywords = import.meta.env.VITE_YOUTUBE_KEYWORDS;
  if (!keywords) {
    console.error('YouTube search keywords are missing');
    return null;
  }
  return `https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(keywords)}`;
}

function getForumUrl(): string | null {
  const url = import.meta.env.VITE_FORUM_API_URL;
  if (!url) {
    console.error('Forum API URL is missing');
    return null;
  }
  return url;
}

function getBlueSkyUrl(): string | null {
  const identifier = import.meta.env.VITE_BLUESKY_IDENTIFIER;
  if (!identifier) {
    console.error('BlueSky identifier is missing');
    return null;
  }
  return `https://bsky.social/xrpc/app.bsky.feed.searchPosts`;
}

// Get RSS feed configurations dynamically
function getRSSFeeds() {
  const feeds = [];
  let index = 1;

  while (true) {
    const name = import.meta.env[`VITE_RSS_FEED_${index}_NAME`];
    const url = import.meta.env[`VITE_RSS_FEED_${index}_URL`];

    // If either name or url is missing, we've reached the end
    if (!name || !url) {
      break;
    }

    feeds.push({
      id: `rss-feed-${index}`,
      type: 'rss' as const,
      name,
      url,
      enabled: true
    });

    index++;
  }

  console.debug('[Sources] Found RSS feeds:', feeds);
  return feeds;
}

// Create sources array with required environment variables
const sources: SourceConfig[] = [
  // Add Gartner Reviews source (always available since it's static)
  {
    id: 'gartner',
    type: 'review',
    url: '/data/gartner-reviews.json',
    enabled: true
  }
];

// Add Forum source if configured
const forumUrl = getForumUrl();
if (forumUrl && import.meta.env.VITE_FORUM_API_KEY) {
  sources.push({
    id: 'vanilla-forum',
    type: 'forum',
    url: forumUrl,
    apiKey: import.meta.env.VITE_FORUM_API_KEY,
    enabled: true,
  });
}

// Add YouTube channel if configured
const youtubeUrl = getYouTubeUrl();
if (youtubeUrl && import.meta.env.VITE_YOUTUBE_API_TOKEN) {
  sources.push({
    id: 'youtube',
    type: 'youtube',
    url: youtubeUrl,
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: false, // YouTube channel disabled by default
  });
}

// Add YouTube search if configured
const youtubeSearchUrl = getYouTubeSearchUrl();
if (youtubeSearchUrl && import.meta.env.VITE_YOUTUBE_API_TOKEN) {
  sources.push({
    id: 'youtube-search',
    type: 'youtube-search',
    url: youtubeSearchUrl,
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: false, // YouTube search disabled by default
  });
}

// Add BlueSky if configured
const blueSkyUrl = getBlueSkyUrl();
if (blueSkyUrl && import.meta.env.VITE_BLUESKY_APP_PASSWORD) {
  sources.push({
    id: 'bluesky',
    type: 'social',
    url: blueSkyUrl,
    apiKey: import.meta.env.VITE_BLUESKY_APP_PASSWORD,
    enabled: true,
  });
}

// Add RSS feeds dynamically
sources.push(...getRSSFeeds());

export const defaultSources = sources;
