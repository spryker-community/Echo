import React, { useState } from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSources } from '../context/SourceContext';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';

export function SourceFilter() {
  const { sources, toggleSource } = useSources();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pass false to prevent initial fetch, we'll only use the cached data here
  const { data: youtubeVideos, error: youtubeError } = useYouTubeVideos(false);
  const { data: forumPosts, error: forumError } = useForumPosts(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Invalidate both queries to force a refresh
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['youtubeVideos'] }),
        queryClient.invalidateQueries({ queryKey: ['forumPosts'] })
      ]);

      showToast({
        title: 'Sources Refreshed',
        description: 'Content has been updated from all sources.',
      });
    } catch (error) {
      showToast({
        title: 'Refresh Failed',
        description: 'Failed to refresh content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
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
    if (sourceId === 'vanilla-forum') {
      if (forumError) return '(Error)';
      if (!forumPosts?.length) return '(No posts)';
      return `(${forumPosts.length} posts)`;
    }
    return '';
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'youtube':
        return '/images/youtube.svg';
      case 'vanilla-forum':
        return '/images/commercequest.png';
      default:
        return '';
    }
  };

  const getSourceLabel = (sourceId: string) => {
    switch (sourceId) {
      case 'youtube':
        return 'YouTube';
      case 'vanilla-forum':
        return 'Community Forum';
      default:
        return sourceId;
    }
  };

  const getStatusColor = (sourceId: string) => {
    if (sourceId === 'youtube' && youtubeError) {
      const errorMessage = youtubeError instanceof Error ? youtubeError.message : String(youtubeError);
      if (errorMessage.includes('quota exceeded')) {
        return 'text-yellow-500 dark:text-yellow-400';
      }
      return 'text-red-500 dark:text-red-400';
    }
    if (sourceId === 'vanilla-forum' && forumError) {
      return 'text-red-500 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Content Sources
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200
                     ${isRefreshing 
                       ? 'text-gray-400 border-gray-400 cursor-not-allowed'
                       : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                     } border`}
          aria-label="Refresh sources"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Sources'}
        </button>
      </div>
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
                  className="w-6 h-6 object-contain"
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
