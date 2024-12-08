import React from 'react';
import { ContentCard } from './ContentCard';
import { useContentItems } from '../hooks/useContentItems';
import { useHidden } from '../context/HiddenContext';
import { useMessageGeneration } from '../hooks/useMessageGeneration';
import { ContentItem, GeneratedPost } from '../types';

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
  const visibleItems = items.filter(item => !isHidden(item.id));

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No content to display. Try enabling more sources or refreshing the content.
        </p>
      </div>
    );
  }

  if (visibleItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          All posts are currently hidden. Use the "Show Hidden" button to restore them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
