import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSources } from '../context/SourceContext';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';
import { useBlueSkyPosts } from '../hooks/useBlueSkyPosts';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { useHidden } from '../context/HiddenContext';
import { Eye, RefreshCw } from 'lucide-react';

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

  const handleRefresh = async () => {
    try {
      // Clear all caches first
      await queryClient.resetQueries();
      
      // Force refetch all queries
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['youtubeVideos'] }),
        queryClient.refetchQueries({ queryKey: ['forumPosts'] }),
        queryClient.refetchQueries({ queryKey: ['blueSkyPosts'] })
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
          return '(API Limit Reached)';
        }
        return '(Error)';
      }
      if (!youtubeVideos?.length) return '(No videos)';
      return `(${youtubeVideos.length} videos)`;
    }
    if (sourceId === 'youtube-search') {
      if (youtubeSearchError) {
        const errorMessage = youtubeSearchError instanceof Error ? youtubeSearchError.message : String(youtubeSearchError);
        if (errorMessage.includes('quota exceeded')) {
          return '(API Limit Reached)';
        }
        return '(Error)';
      }
      if (!youtubeSearchVideos?.length) return '(No videos)';
      return `(${youtubeSearchVideos.length} videos)`;
    }
    if (sourceId === 'vanilla-forum') {
      if (forumError) return '(Error)';
      if (!forumPosts?.length) return '(No posts)';
      return `(${forumPosts.length} posts)`;
    }
    if (sourceId === 'bluesky') {
      if (blueSkyError) {
        const errorMessage = blueSkyError instanceof Error ? blueSkyError.message : String(blueSkyError);
        if (errorMessage.includes('authenticate')) {
          return '(Auth Error)';
        }
        return '(Error)';
      }
      if (!blueSkyPosts?.length) return '(No posts)';
      return `(${blueSkyPosts.length} posts)`;
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
        return '';
    }
  };

  const getSourceLabel = (sourceId: string) => {
    switch (sourceId) {
      case 'youtube':
        return 'Our YouTube Channel';
      case 'youtube-search':
        return 'YouTube Search';
      case 'vanilla-forum':
        return 'Community Forum';
      case 'bluesky':
        return 'BlueSky Posts';
      default:
        return sourceId;
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
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-2">
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
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Showing the 20-30 most recent items from each source. Use the toggles to filter content.
      </p>
      <div className="space-y-4">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Label htmlFor={source.id} className="flex items-center space-x-2">
                <img 
                  src={getSourceIcon(source.id)} 
                  alt={getSourceLabel(source.id)}
                  className="w-5 h-5 object-contain"
                />
                <span className="font-medium">
                  {getSourceLabel(source.id)}
                </span>
                <span className={`text-sm ${getStatusColor(source.id)}`}>
                  {getSourceStatus(source.id)}
                </span>
              </Label>
            </div>
            <Switch
              id={source.id}
              checked={source.enabled}
              onCheckedChange={() => toggleSource(source.id)}
              aria-label={`Toggle ${getSourceLabel(source.id)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
