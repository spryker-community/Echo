import { useMemo } from 'react';
import { useForumPosts } from './useForumPosts';
import { useYouTubeVideos } from './useYouTubeVideos';
import { useBlueSkyPosts } from './useBlueSkyPosts';
import { useRSSFeeds } from './useRSSFeeds';
import { useGartnerReviews } from './useGartnerReviews';
import { useSources } from '../context/SourceContext';
import { ContentItem } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useContentItems() {
  const { sources } = useSources();
  const queryClient = useQueryClient();
  
  // Only enable APIs when their source is enabled
  const forumEnabled = sources.find(s => s.id === 'vanilla-forum')?.enabled ?? false;
  const youtubeEnabled = sources.find(s => s.id === 'youtube')?.enabled ?? false;
  const youtubeSearchEnabled = sources.find(s => s.id === 'youtube-search')?.enabled ?? false;
  const blueSkyEnabled = sources.find(s => s.id === 'bluesky')?.enabled ?? false;
  const gartnerEnabled = sources.find(s => s.id === 'gartner')?.enabled ?? true; // Enable by default
  // Check if any RSS feed is enabled
  const rssEnabled = sources.some(s => s.type === 'rss' && s.enabled);

  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    queryClient.invalidateQueries({ queryKey: ['youtubeVideos'] });
    queryClient.invalidateQueries({ queryKey: ['blueSkyPosts'] });
    queryClient.invalidateQueries({ queryKey: ['rss-feeds'] });
    queryClient.invalidateQueries({ queryKey: ['gartner-reviews'] });
  }, [queryClient]);

  const { data: forumPosts = [], error: forumError } = useForumPosts(forumEnabled);
  const { data: youtubeVideos = [], error: youtubeError } = useYouTubeVideos(youtubeEnabled, 'youtube');
  const { data: youtubeSearchVideos = [], error: youtubeSearchError } = useYouTubeVideos(youtubeSearchEnabled, 'youtube-search');
  const { data: blueSkyPosts = [], error: blueSkyError } = useBlueSkyPosts(blueSkyEnabled);
  const { items: rssItems = [], error: rssError } = useRSSFeeds(rssEnabled);
  const { items: gartnerReviews = [], error: gartnerError } = useGartnerReviews();

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
    },
    blueSky: {
      enabled: blueSkyEnabled,
      postsCount: blueSkyPosts.length,
      hasError: !!blueSkyError,
      error: blueSkyError ? String(blueSkyError) : null
    },
    rss: {
      enabled: rssEnabled,
      itemsCount: rssItems.length,
      hasError: !!rssError,
      error: rssError ? String(rssError) : null
    },
    gartner: {
      enabled: gartnerEnabled,
      reviewsCount: gartnerReviews.length,
      hasError: !!gartnerError,
      error: gartnerError ? String(gartnerError) : null
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

    // Add BlueSky posts if source is enabled and we have data
    if (enabledSources.includes('bluesky') && blueSkyPosts.length > 0) {
      allItems.push(...blueSkyPosts);
    }

    // Add RSS items if any RSS feed is enabled and we have data
    if (rssEnabled && rssItems.length > 0) {
      allItems.push(...rssItems);
    }

    // Add Gartner reviews if enabled and we have data
    if ((enabledSources.includes('gartner') || gartnerEnabled) && gartnerReviews.length > 0) {
      allItems.push(...gartnerReviews);
    }

    // Sort by date, most recent first
    return allItems.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [forumPosts, youtubeVideos, youtubeSearchVideos, blueSkyPosts, rssItems, gartnerReviews, enabledSources, rssEnabled, gartnerEnabled]);

  // Log final items for debugging
  console.log('Final Content Items:', {
    totalCount: items.length,
    bySource: {
      forum: items.filter(item => item.source === 'vanilla-forum').length,
      youtube: items.filter(item => item.source === 'youtube').length,
      youtubeSearch: items.filter(item => item.source === 'youtube-search').length,
      blueSky: items.filter(item => item.source === 'bluesky').length,
      rss: items.filter(item => item.source === 'rss').length,
      gartner: items.filter(item => item.source === 'gartner').length
    }
  });

  return items;
}
