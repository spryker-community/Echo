import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSources } from '../context/SourceContext';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';

export function SourceFilter() {
  const { sources, toggleSource } = useSources();
  const { data: youtubeVideos, error: youtubeError } = useYouTubeVideos();
  const { data: forumPosts, error: forumError } = useForumPosts();

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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Content Sources
      </h2>
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
