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
  generatedMessage?: {
    content: string;
    targetAudiences: string[];
    sourceItem: ContentItem;
  };
  generatingForItem?: ContentItem | null;
}

export function FeedViewer({ onGenerate, generatedMessage, generatingForItem }: FeedViewerProps) {
  const items = useContentItems();
  const { sources } = useSources();
  
  // Only enable APIs when their source is enabled
  const forumEnabled = sources.find(s => s.id === 'vanilla-forum')?.enabled ?? false;
  const youtubeEnabled = sources.find(s => s.id === 'youtube')?.enabled ?? false;
  
  // Pass enabled state to hooks to control fetching
  const { error: youtubeError, isLoading: youtubeLoading } = useYouTubeVideos(youtubeEnabled);
  const { error: forumError, isLoading: forumLoading } = useForumPosts(forumEnabled);

  const getNoContentMessage = () => {
    const enabledSources = sources.filter(s => s.enabled);
    
    if (enabledSources.length === 0) {
      return {
        title: 'No Sources Selected',
        description: 'Enable content sources above to view items.'
      };
    }

    // Show loading state when any enabled source is loading
    if ((youtubeEnabled && youtubeLoading) || (forumEnabled && forumLoading)) {
      return {
        title: 'Loading Content',
        description: 'Fetching content from selected sources...'
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

    if (items.length === 0 && enabledSources.length > 0) {
      return {
        title: 'No Content Available',
        description: 'No content found from the selected sources. Try enabling more sources or refreshing the content.'
      };
    }

    return {
      title: 'No Content Available',
      description: 'Select sources above or check your connection to view content.'
    };
  };

  // Show loading skeleton when any enabled source is loading
  const isLoading = (youtubeEnabled && youtubeLoading) || (forumEnabled && forumLoading);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SourceFilter />
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((n) => (
            <div 
              key={n}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse"
            >
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <ContentCard
                item={item}
                onGenerate={onGenerate}
                isGenerating={generatingForItem?.id === item.id}
                generatedContent={
                  generatedMessage?.sourceItem.id === item.id
                    ? {
                        content: generatedMessage.content,
                        targetAudiences: generatedMessage.targetAudiences
                      }
                    : undefined
                }
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
