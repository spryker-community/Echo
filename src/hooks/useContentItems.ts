import { useMemo } from 'react';
import { useForumPosts } from './useForumPosts';
import { useYouTubeVideos } from './useYouTubeVideos';
import { useSources } from '../context/SourceContext';
import { ContentItem } from '../types';

export function useContentItems() {
  const { sources } = useSources();
  
  // Only enable APIs when their source is enabled
  const forumEnabled = sources.find(s => s.id === 'vanilla-forum')?.enabled ?? false;
  const youtubeEnabled = sources.find(s => s.id === 'youtube')?.enabled ?? false;
  const youtubeSearchEnabled = sources.find(s => s.id === 'youtube-search')?.enabled ?? false;

  const { data: forumPosts = [], error: forumError } = useForumPosts(forumEnabled);
  const { data: youtubeVideos = [], error: youtubeError } = useYouTubeVideos(youtubeEnabled, 'youtube');
  const { data: youtubeSearchVideos = [], error: youtubeSearchError } = useYouTubeVideos(youtubeSearchEnabled, 'youtube-search');

  // Log source status for debugging
  console.log('Content Sources Status:', {
    forum: {
      enabled: forumEnabled,
      postsCount: forumPosts.length,
      hasError: !!forumError,
      error: forumError ? String(forumError) : null
    },
    youtube: {
      enabled: youtubeEnabled,
      videosCount: youtubeVideos.length,
      hasError: !!youtubeError,
      error: youtubeError ? String(youtubeError) : null,
      quotaExceeded: youtubeError instanceof Error && 
                    youtubeError.message.includes('quota exceeded')
    },
    youtubeSearch: {
      enabled: youtubeSearchEnabled,
      videosCount: youtubeSearchVideos.length,
      hasError: !!youtubeSearchError,
      error: youtubeSearchError ? String(youtubeSearchError) : null,
      quotaExceeded: youtubeSearchError instanceof Error && 
                    youtubeSearchError.message.includes('quota exceeded')
    }
  });

  const enabledSources = useMemo(() => {
    return sources
      .filter(source => source.enabled)
      .map(source => source.id);
  }, [sources]);

  const items = useMemo(() => {
    const allItems: ContentItem[] = [];

    // Add forum posts if source is enabled and we have data
    if (enabledSources.includes('vanilla-forum') && forumPosts.length > 0) {
      allItems.push(...forumPosts);
    }

    // Add YouTube channel videos if source is enabled and we have data
    if (enabledSources.includes('youtube') && youtubeVideos.length > 0) {
      allItems.push(...youtubeVideos);
    }

    // Add YouTube search videos if source is enabled and we have data
    if (enabledSources.includes('youtube-search') && youtubeSearchVideos.length > 0) {
      allItems.push(...youtubeSearchVideos);
    }

    // Sort by date, most recent first
    return allItems.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [forumPosts, youtubeVideos, youtubeSearchVideos, enabledSources]);

  // Log final items for debugging
  console.log('Final Content Items:', {
    totalCount: items.length,
    bySource: {
      forum: items.filter(item => item.source === 'vanilla-forum').length,
      youtube: items.filter(item => item.source === 'youtube').length,
      youtubeSearch: items.filter(item => item.source === 'youtube-search').length
    }
  });

  return items;
}
