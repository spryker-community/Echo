import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSources } from '../context/SourceContext';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';
import { useQueryClient } from '@tanstack/react-query';

export function SourceFilter() {
  const { sources, toggleSource } = useSources();
  const queryClient = useQueryClient();
  
  // Pass false to prevent initial fetch, we'll only use the cached data here
  const { data: youtubeVideos, error: youtubeError } = useYouTubeVideos(false, 'youtube');
  const { data: youtubeSearchVideos, error: youtubeSearchError } = useYouTubeVideos(false, 'youtube-search');
  const { data: forumPosts, error: forumError } = useForumPosts(false);

  const handleRefresh = async () => {
    // Invalidate all queries to force a refresh
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['youtubeVideos', 'youtube'] }),
      queryClient.invalidateQueries({ queryKey: ['youtubeVideos', 'youtube-search'] }),
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] })
    ]);
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
    return '';
  };

  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'youtube':
      case 'youtube-search':
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
        return 'Our YouTube Channel';
      case 'youtube-search':
        return 'YouTube Search';
      case 'vanilla-forum':
        return 'Community Forum';
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
          className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 
                   dark:text-blue-400 dark:hover:text-blue-300 
                   border border-blue-600 dark:border-blue-400 rounded-lg 
                   hover:bg-blue-50 dark:hover:bg-blue-900/20 
                   transition-colors duration-200"
          aria-label="Refresh sources"
        >
          Refresh Sources
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
