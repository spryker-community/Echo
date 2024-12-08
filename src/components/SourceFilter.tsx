import React from 'react';
import { useSources } from '../context/SourceContext';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';
import { useBlueSkyPosts } from '../hooks/useBlueSkyPosts';
import { useRSSFeeds } from '../hooks/useRSSFeeds';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { useHidden } from '../context/HiddenContext';
import { Eye, RefreshCw } from 'lucide-react';
import { SourceConfig, RSSSourceConfig } from '../types';

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

  const getSourceStatus = (sourceId: string) => {
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
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'youtube':
      case 'youtube-search':
        return '/images/youtube.svg';
      case 'vanilla-forum':
        return '/images/commercequest.png';
      case 'bluesky':
        return '/images/bluesky.svg';
      default:
        if (sourceId.startsWith('rss-feed-')) {
          return '/images/rss.svg';
        }
        return '';
    }
  };

  const getSourceLabel = (source: SourceConfig) => {
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
      default:
        return source.id;
    }
  };

  const getStatusColor = (sourceId: string) => {
    if ((sourceId === 'youtube' && youtubeError) || (sourceId === 'youtube-search' && youtubeSearchError)) {
      const errorMessage = sourceId === 'youtube' 
        ? youtubeError instanceof Error ? youtubeError.message : String(youtubeError)
        : youtubeSearchError instanceof Error ? youtubeSearchError.message : String(youtubeSearchError);
      
      if (errorMessage.includes('quota exceeded')) {
        return 'text-yellow-500 dark:text-yellow-400';
      }
      return 'text-red-500 dark:text-red-400';
    }
    if (sourceId === 'vanilla-forum' && forumError) {
      return 'text-red-500 dark:text-red-400';
    }
    if (sourceId === 'bluesky' && blueSkyError) {
      return 'text-red-500 dark:text-red-400';
    }
    if (sourceId.startsWith('rss-feed-') && rssError) {
      return 'text-red-500 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  // Separate sources into main and RSS feeds
  const mainSources = sources.filter(source => source.type !== 'rss');
  const rssFeeds = sources.filter(source => source.type === 'rss');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Content Sources
        </h2>
        <div className="flex items-center gap-2">
          {hiddenCount > 0 && (
            <button
              onClick={handleUnhideAll}
              className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 
                       dark:text-blue-400 dark:hover:text-blue-300 
                       border border-blue-600 dark:border-blue-400 rounded-lg 
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 
                       transition-colors duration-200"
              aria-label={`Show ${hiddenCount} hidden posts`}
            >
              <Eye className="w-4 h-4" />
              <span>Show Hidden ({hiddenCount})</span>
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 
                     dark:text-blue-400 dark:hover:text-blue-300 
                     border border-blue-600 dark:border-blue-400 rounded-lg 
                     hover:bg-blue-50 dark:hover:bg-blue-900/20 
                     transition-colors duration-200"
            aria-label="Refresh sources"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Sources</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Main sources grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {mainSources.map((source) => (
            <button
              key={source.id}
              onClick={() => toggleSource(source.id)}
              className={`h-20 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                         hover:scale-[1.02] hover:shadow-md
                         ${source.enabled 
                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                           : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/50 dark:bg-gray-800/50'}`}
            >
              <img 
                src={getSourceIcon(source.id)} 
                alt={getSourceLabel(source)}
                className="w-6 h-6 object-contain mb-1"
              />
              <span className={`text-xs font-medium leading-none text-center mb-1 ${source.enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                {getSourceLabel(source)}
              </span>
              <span className={`text-[10px] leading-none ${getStatusColor(source.id)}`}>
                {getSourceStatus(source.id)}
              </span>
            </button>
          ))}
        </div>

        {/* RSS feeds grid */}
        {rssFeeds.length > 0 && (
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {rssFeeds.map((source) => (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`h-20 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                           hover:scale-[1.02] hover:shadow-md
                           ${source.enabled 
                             ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                             : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 bg-gray-50/50 dark:bg-gray-800/50'}`}
              >
                <img 
                  src={getSourceIcon(source.id)} 
                  alt={getSourceLabel(source)}
                  className="w-6 h-6 object-contain mb-1"
                />
                <span className={`text-xs font-semibold leading-tight text-center mb-1 line-clamp-2 ${source.enabled ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {getSourceLabel(source)}
                </span>
                <span className={`text-[10px] leading-none ${getStatusColor(source.id)}`}>
                  {getSourceStatus(source.id)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
