import { useMemo } from 'react';
import { useForumPosts } from './useForumPosts';
import { useYouTubeVideos } from './useYouTubeVideos';
import { useSources } from '../context/SourceContext';
import { ContentItem } from '../types';

export function useContentItems() {
  const { data: forumPosts = [], error: forumError } = useForumPosts();
  const { data: youtubeVideos = [], error: youtubeError } = useYouTubeVideos();
  const { sources } = useSources();

  // Log source status for debugging
  console.log('Content Sources Status:', {
    forum: {
      postsCount: forumPosts.length,
      hasError: !!forumError,
      error: forumError ? String(forumError) : null
    },
    youtube: {
      videosCount: youtubeVideos.length,
      hasError: !!youtubeError,
      error: youtubeError ? String(youtubeError) : null,
      quotaExceeded: youtubeError instanceof Error && 
                    youtubeError.message.includes('quota exceeded')
    }
  });

  const enabledSources = useMemo(() => {
    return sources
      .filter(source => source.enabled)
      .map(source => source.id);
  }, [sources]);

  const items = useMemo(() => {
    const allItems: ContentItem[] = [];

    // Add forum posts if source is enabled and no error
    if (enabledSources.includes('vanilla-forum') && !forumError) {
      allItems.push(...forumPosts);
    }

    // Add YouTube videos if source is enabled and no error
    // Note: We still add videos if we have them, even if quota is exceeded
    if (enabledSources.includes('youtube')) {
      if (youtubeVideos.length > 0) {
        allItems.push(...youtubeVideos);
      }
    }

    // Sort by date, most recent first
    return allItems.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [forumPosts, youtubeVideos, enabledSources, forumError]);

  // Log final items for debugging
  console.log('Final Content Items:', {
    totalCount: items.length,
    bySource: {
      forum: items.filter(item => item.source === 'vanilla-forum').length,
      youtube: items.filter(item => item.source === 'youtube').length
    },
    youtubeStatus: youtubeError ? 
      (youtubeError instanceof Error ? youtubeError.message : 'Unknown error') : 
      'OK'
  });

  return items;
}
