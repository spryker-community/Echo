import { useMutation } from '@tanstack/react-query';
import { ContentItem } from '../types';
import { useToast } from './useToast';
import { generateMessageForItem } from '../lib/message-generation/generate-message';

export function useMessageGeneration() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (item: ContentItem) => {
      try {
        // Log the item being processed
        console.log('[Message Generation] Processing item:', {
          id: item.id,
          title: item.title,
          source: item.source
        });

        const result = await generateMessageForItem(item, (message) => {
          // Only show non-error warnings
          if (!message.toLowerCase().includes('error') && !message.toLowerCase().includes('prohibited')) {
            showToast({
              title: 'Info',
              description: message,
            });
          }
        });

        console.log('[Message Generation] Generated result:', {
          content: result.content.slice(0, 100) + '...',
          audiences: result.targetAudiences
        });

        return result;
      } catch (error) {
        console.error('[Message Generation] Processing error:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('[Message Generation] Error:', error);
      // Only show generic error message to user
      showToast({
        title: 'Error',
        description: 'Failed to generate message. Please try again.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      showToast({
        title: 'Success',
        description: 'Insight generated successfully.',
      });
    }
  });
}
