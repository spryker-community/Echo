import { SourceConfig } from '../types';

function getYouTubeUrl(): string {
  const channelId = import.meta.env.VITE_YOUTUBE_CHANNEL_ID;
  if (!channelId) {
    console.error('YouTube Channel ID is missing');
    return '';
  }
  return `https://www.googleapis.com/youtube/v3/search?channelId=${channelId}`;
}

function getForumUrl(): string {
  const url = import.meta.env.VITE_FORUM_API_URL;
  if (!url) {
    console.error('Forum API URL is missing');
    return '';
  }
  return url;
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
];
