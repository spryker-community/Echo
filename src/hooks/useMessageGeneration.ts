import { useMutation } from '@tanstack/react-query';
import { analyzeAudience, generatePost } from '../lib/api/message';
import { ContentItem, Team } from '../types';

interface GenerateMessageResult {
  content: string;
  targetAudiences: Team[];
}

export function useMessageGeneration() {
  return useMutation({
    mutationFn: async (item: ContentItem): Promise<GenerateMessageResult> => {
      const targetAudiences = await analyzeAudience(item);
      const content = await generatePost(item, targetAudiences);
      
      return {
        content,
        targetAudiences,
      };
    },
  });
}