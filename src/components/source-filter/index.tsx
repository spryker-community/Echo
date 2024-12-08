import React from 'react';
import { useSources } from '../../context/SourceContext';
import { useYouTubeVideos } from '../../hooks/useYouTubeVideos';
import { useForumPosts } from '../../hooks/useForumPosts';
import { useBlueSkyPosts } from '../../hooks/useBlueSkyPosts';
import { useRSSFeeds } from '../../hooks/useRSSFeeds';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../hooks/useToast';
import { useHidden } from '../../context/HiddenContext';
import { SourceConfig, RSSSourceConfig } from '../../types';

import { SourceFilterHeader } from './SourceFilterHeader';
import { SourceGrid } from './SourceGrid';
import { getSourceIcon, getSourceLabel, getStatusColor } from './source-utils';
import { useSourceStatus } from './useSourceStatus';

export function SourceFilter() {
  const { sources, toggleSource } = useSources();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { hiddenCount, unhideAll } = useHidden();
  
  // Pass false to prevent initial fetch, we'll only use the cached data here
  const { data: youtubeVideos, error: youtubeError } = useYouTubeVideos(false, 'youtube');
  const { data: youtubeSearchVideos, error: youtubeSearchError } = useYouTubeVideos(false, 'youtube-search');
  const { data: forumPosts, error: forumError } = useForumPosts(false);
  const { data: blueSkyPosts, error: blueSkyError } = useBlueSkyPosts(false);
  const { items: rssItems, error: rssError } = useRSSFeeds(false);

  const errors = {
    youtubeError,
    youtubeSearchError,
    forumError,
    blueSkyError,
    rssError
  };

  const handleRefresh = async () => {
    try {
      await queryClient.resetQueries();
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['youtubeVideos'] }),
        queryClient.refetchQueries({ queryKey: ['forumPosts'] }),
        queryClient.refetchQueries({ queryKey: ['blueSkyPosts'] }),
        queryClient.refetchQueries({ queryKey: ['rss-feeds'] })
      ]);

      showToast({
        title: "Sources Refreshed",
        description: "All content has been updated."
      });
    } catch (error) {
      console.error('Error refreshing sources:', error);
      showToast({
        title: "Refresh Failed",
        description: "Failed to refresh content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnhideAll = () => {
    unhideAll();
    showToast({
      title: "Posts Unhidden",
      description: `${hiddenCount} posts have been restored.`
    });
  };

  const getStatus = (sourceId: string) => useSourceStatus({
    sourceId,
    sources,
    youtubeVideos,
    youtubeSearchVideos,
    forumPosts,
    blueSkyPosts,
    rssItems,
    errors
  });

  // Separate sources into main and RSS feeds
  const mainSources: SourceConfig[] = sources.filter(source => source.type !== 'rss');
  const rssFeeds: RSSSourceConfig[] = sources.filter((source): source is RSSSourceConfig => source.type === 'rss');

  return (
    <div className="bg-white dark:bg-[#011427] rounded-xl p-4 shadow-sm">
      <SourceFilterHeader
        hiddenCount={hiddenCount}
        onUnhideAll={handleUnhideAll}
        onRefresh={handleRefresh}
      />

      <div className="space-y-2">
        <SourceGrid
          sources={mainSources}
          getIcon={getSourceIcon}
          getLabel={getSourceLabel}
          getStatus={getStatus}
          getStatusColor={(id) => getStatusColor(id, errors)}
          onToggle={toggleSource}
        />

        {rssFeeds.length > 0 && (
          <SourceGrid
            sources={rssFeeds}
            getIcon={getSourceIcon}
            getLabel={getSourceLabel}
            getStatus={getStatus}
            getStatusColor={(id) => getStatusColor(id, errors)}
            onToggle={toggleSource}
            isRSSGrid
          />
        )}
      </div>
    </div>
  );
}
