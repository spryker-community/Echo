import { SourceConfig } from '../types';

export const defaultSources: SourceConfig[] = [
  {
    id: 'vanilla-forum',
    type: 'forum',
    url: import.meta.env.VITE_FORUM_API_URL,
    apiKey: import.meta.env.VITE_FORUM_API_KEY,
    enabled: true,
  },
  {
    id: 'youtube',
    type: 'youtube',
    url: `https://www.googleapis.com/youtube/v3/search?channelId=${import.meta.env.VITE_YOUTUBE_CHANNEL_ID}`,
    apiKey: import.meta.env.VITE_YOUTUBE_API_TOKEN,
    enabled: true,
  },
];
