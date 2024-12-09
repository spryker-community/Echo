import { useMutation } from '@tanstack/react-query';
import { ContentItem } from '../types';
import { useToast } from './useToast';
import { generateMessageForItem } from '../lib/message-generation/generate-message';

export function useMessageGeneration() {
  const { showToast } = useToast();

  return useMutation({
    mutationFn: (item: ContentItem) => generateMessageForItem(item, (message) => {
      showToast({
        title: 'Warning',
        description: message,
        variant: 'destructive',
      });
    }),
    onError: (error) => {
      console.error('[Message Generation] Error:', error);
      showToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate message. Please try again.',
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
