import { useMutation } from '@tanstack/react-query';
import { analyzeAudience, generatePost } from '../lib/api/message';
import { ContentItem, Team } from '../types';

interface GenerateMessageResult {
  content: string;
  targetAudiences: Team[];
}

export function useMessageGeneration() {
  return useMutation<GenerateMessageResult, Error, ContentItem>({
    mutationFn: async (item: ContentItem): Promise<GenerateMessageResult> => {
      try {
        console.log('Starting message generation for item:', item);
        
        const targetAudiences = await analyzeAudience(item);
        console.log('Audience analysis complete:', targetAudiences);

        const content = await generatePost(item, targetAudiences);
        console.log('Post generation complete:', content);

        const result = {
          content,
          targetAudiences,
        };
        console.log('Message generation successful:', result);
        return result;
      } catch (error) {
        console.error('Message generation failed:', error);
        throw error;
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  });
}
