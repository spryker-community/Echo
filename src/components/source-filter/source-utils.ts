import { SourceConfig } from '../../types';

export function getSourceIcon(sourceId: string): string {
  switch (sourceId) {
    case 'youtube':
    case 'youtube-search':
      return '/images/youtube.svg';
    case 'vanilla-forum':
      return '/images/commercequest.png';
    case 'bluesky':
      return '/images/bluesky.svg';
    case 'gartner':
      return '/images/gartner.png';
    default:
      if (sourceId.startsWith('rss-feed-')) {
        return '/images/rss.svg';
      }
      return '';
  }
}

export function getSourceLabel(source: SourceConfig): string {
  if (source.type === 'rss' && 'name' in source) {
    return source.name;
  }

  switch (source.id) {
    case 'youtube':
      return 'YouTube Channel';
    case 'youtube-search':
      return 'YouTube Search';
    case 'vanilla-forum':
      return 'Community Forum';
    case 'bluesky':
      return 'BlueSky Posts';
    case 'gartner':
      return 'Gartner Reviews';
    default:
      return source.id;
  }
}

export function getStatusColor(
  sourceId: string,
  errors: {
    youtubeError?: Error | null;
    youtubeSearchError?: Error | null;
    forumError?: Error | null;
    blueSkyError?: Error | null;
    rssError?: Error | null;
    gartnerError?: Error | null;
  }
): string {
  const { youtubeError, youtubeSearchError, forumError, blueSkyError, rssError, gartnerError } = errors;

  if ((sourceId === 'youtube' && youtubeError) || (sourceId === 'youtube-search' && youtubeSearchError)) {
    const errorMessage = sourceId === 'youtube' 
      ? youtubeError instanceof Error ? youtubeError.message : String(youtubeError)
      : youtubeSearchError instanceof Error ? youtubeSearchError.message : String(youtubeSearchError);
    
    if (errorMessage.includes('quota exceeded')) {
      return 'text-[#EC008C] dark:text-[#EC008C]';
    }
    return 'text-red-500 dark:text-red-500';
  }
  if (sourceId === 'vanilla-forum' && forumError) {
    return 'text-red-500 dark:text-red-500';
  }
  if (sourceId === 'bluesky' && blueSkyError) {
    return 'text-red-500 dark:text-red-500';
  }
  if (sourceId === 'gartner' && gartnerError) {
    return 'text-red-500 dark:text-red-500';
  }
  if (sourceId.startsWith('rss-feed-') && rssError) {
    return 'text-red-500 dark:text-red-500';
  }
  return 'text-gray-500 dark:text-[#00AEEF]/60';
}
