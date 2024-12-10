import React from 'react';
import { ContentCard } from './ContentCard';
import { useContentItems } from '../hooks/useContentItems';
import { useHidden } from '../context/HiddenContext';
import { useMessageGeneration } from '../hooks/useMessageGeneration';
import { ContentItem } from '../types';

export function FeedViewer() {
  const items = useContentItems();
  const { isHidden } = useHidden();
  const { 
    mutate: generateMessage, 
    data: generatedMessage,
    isPending: isGenerating,
    variables: currentItem
  } = useMessageGeneration();

  // Create a map of generated messages by item ID
  const generatedMessages = React.useMemo(() => {
    if (!generatedMessage) return {};
    return {
      [generatedMessage.sourceItem.id]: {
        content: generatedMessage.content,
        targetAudiences: generatedMessage.targetAudiences
      }
    };
  }, [generatedMessage]);

  // Filter out hidden items
  const visibleItems = React.useMemo(() => 
    items.filter(item => !isHidden(item.id)),
    [items, isHidden]
  );

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-white to-gray-50/30 
                    dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60 
                    rounded-xl p-12 text-center backdrop-blur-sm
                    border border-gray-100/50 dark:border-gray-700/50
                    shadow-sm font-manrope">
        <p className="text-gray-500 dark:text-gray-400">
          No content to display. Try enabling more sources or refreshing the content.
        </p>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white via-white to-gray-50/30 
                    dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60 
                    rounded-xl p-12 text-center backdrop-blur-sm
                    border border-gray-100/50 dark:border-gray-700/50
                    shadow-sm font-manrope">
        <p className="text-gray-500 dark:text-gray-400">
          All posts are currently hidden. Use the "Show Hidden" button above to restore them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {visibleItems.map(item => (
        <ContentCard
          key={item.id}
          item={item}
          onGenerate={(item: ContentItem) => generateMessage(item)}
          generatedContent={generatedMessages[item.id]}
          isGenerating={isGenerating && currentItem?.id === item.id}
        />
      ))}
    </div>
  );
}
