import React from 'react';
import { ContentCard } from './ContentCard';
import { SourceFilter } from './SourceFilter';
import { useContentItems } from '../hooks/useContentItems';
import { useYouTubeVideos } from '../hooks/useYouTubeVideos';
import { useForumPosts } from '../hooks/useForumPosts';
import { ContentItem } from '../types';
import { useSources } from '../context/SourceContext';

interface FeedViewerProps {
  onGenerate: (item: ContentItem) => void;
}

export function FeedViewer({ onGenerate }: FeedViewerProps) {
  const items = useContentItems();
  const { error: youtubeError } = useYouTubeVideos();
  const { error: forumError } = useForumPosts();
  const { sources } = useSources();

  const getNoContentMessage = () => {
    const enabledSources = sources.filter(s => s.enabled);
    
    if (enabledSources.length === 0) {
      return {
        title: 'No Sources Selected',
        description: 'Enable content sources above to view items.'
      };
    }

    const hasYoutubeQuotaError = youtubeError instanceof Error && 
                                youtubeError.message.includes('quota exceeded');

    if (hasYoutubeQuotaError && !forumError) {
      return {
        title: 'YouTube API Limit Reached',
        description: 'YouTube content is temporarily unavailable due to API limits. The quota will reset at midnight Pacific Time. Forum content is still accessible.'
      };
    }

    if (youtubeError && forumError) {
      return {
        title: 'Content Temporarily Unavailable',
        description: 'We\'re having trouble fetching content. Please try again in a few minutes.'
      };
    }

    return {
      title: 'No Content Available',
      description: 'Select sources above or check your connection to view content.'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SourceFilter />
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="transition-all duration-300 ease-in-out transform hover:-translate-y-2"
            >
              <ContentCard
                item={item}
                onGenerate={onGenerate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            {getNoContentMessage().title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {getNoContentMessage().description}
          </p>
        </div>
      )}
    </div>
  );
}
