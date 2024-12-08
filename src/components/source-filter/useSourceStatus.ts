import { SourceConfig, RSSSourceConfig } from '../../types';

interface UseSourceStatusProps {
  sourceId: string;
  sources: SourceConfig[];
  youtubeVideos?: any[];
  youtubeSearchVideos?: any[];
  forumPosts?: any[];
  blueSkyPosts?: any[];
  rssItems?: any[];
  errors: {
    youtubeError?: Error | null;
    youtubeSearchError?: Error | null;
    forumError?: Error | null;
    blueSkyError?: Error | null;
    rssError?: Error | null;
  };
}

export function useSourceStatus({
  sourceId,
  sources,
  youtubeVideos,
  youtubeSearchVideos,
  forumPosts,
  blueSkyPosts,
  rssItems,
  errors
}: UseSourceStatusProps): string {
  const { youtubeError, youtubeSearchError, forumError, blueSkyError, rssError } = errors;

  if (sourceId === 'youtube') {
    if (youtubeError) {
      const errorMessage = youtubeError instanceof Error ? youtubeError.message : String(youtubeError);
      if (errorMessage.includes('quota exceeded')) {
        return '(API Limit)';
      }
      return '(Error)';
    }
    if (!youtubeVideos?.length) return '0 videos';
    return `${youtubeVideos.length} videos`;
  }

  if (sourceId === 'youtube-search') {
    if (youtubeSearchError) {
      const errorMessage = youtubeSearchError instanceof Error ? youtubeSearchError.message : String(youtubeSearchError);
      if (errorMessage.includes('quota exceeded')) {
        return '(API Limit)';
      }
      return '(Error)';
    }
    if (!youtubeSearchVideos?.length) return '0 videos';
    return `${youtubeSearchVideos.length} videos`;
  }

  if (sourceId === 'vanilla-forum') {
    if (forumError) return '(Error)';
    if (!forumPosts?.length) return '0 posts';
    return `${forumPosts.length} posts`;
  }

  if (sourceId === 'bluesky') {
    if (blueSkyError) {
      const errorMessage = blueSkyError instanceof Error ? blueSkyError.message : String(blueSkyError);
      if (errorMessage.includes('authenticate')) {
        return '(Auth Error)';
      }
      return '(Error)';
    }
    if (!blueSkyPosts?.length) return '0 posts';
    return `${blueSkyPosts.length} posts`;
  }

  if (sourceId.startsWith('rss-feed-')) {
    if (rssError) return '(Error)';
    const source = sources.find(s => s.id === sourceId) as RSSSourceConfig | undefined;
    if (!source) return '0 items';
    
    const feedItems = rssItems?.filter(item => 
      item.source === 'rss' && item.metadata.feedTitle === source.name
    );
    if (!feedItems?.length) return '0 items';
    return `${feedItems.length} items`;
  }

  return '';
}
