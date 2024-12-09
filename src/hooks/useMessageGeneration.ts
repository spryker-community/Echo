import { useMutation } from '@tanstack/react-query';
import { ContentItem, GeneratedPost } from '../types';
import { fetchDiscussionComments } from '../lib/api/forum';
import { useToast } from './useToast';
import { PROHIBITED_PHRASES } from '../config/prohibited-phrases';
import { processForumContent } from '../lib/message-generation/forum';
import { analyzeVideoContent, getYouTubeMessageDirective } from '../lib/message-generation/youtube';
import { analyzeRSSContent, getRSSMessageDirective } from '../lib/message-generation/rss';

async function generateMessageForItem(item: ContentItem, showWarning: (message: string) => void): Promise<GeneratedPost> {
  let fullContent = '';
  let context = '';
  let directive = '';
  let metadata: string[] = [];

  // Process content based on source type
  if (item.source === 'vanilla-forum') {
    const forumContent = await processForumContent(
      item,
      fetchDiscussionComments,
      showWarning
    );
    fullContent = forumContent.fullContent;
    context = forumContent.context;
    directive = forumContent.directive;
    metadata = forumContent.metadata;
  } else if (item.source === 'youtube') {
    const videoAnalysis = analyzeVideoContent(item.title, item.description);
    
    fullContent = `Video Title: ${item.title}\n\nDescription:\n${item.description}`;
    context = `YouTube ${videoAnalysis.contentType} Video`;
    directive = getYouTubeMessageDirective(videoAnalysis);

    // Add video-specific metadata
    fullContent += `\n\nAdditional Context:\n` +
      `Content Type: ${videoAnalysis.contentType}\n` +
      `Complexity Level: ${videoAnalysis.complexity}\n` +
      `Key Topics: ${videoAnalysis.keywords.join(', ')}`;

    metadata = [
      `Channel: ${item.metadata.channelTitle}`,
      `Published: ${new Date(item.date).toLocaleDateString()}`
    ];
  } else if (item.source === 'rss') {
    const rssAnalysis = analyzeRSSContent(item.title, item.description);
    
    fullContent = `Title: ${item.title}\n\nContent:\n${item.description}`;
    context = `RSS ${rssAnalysis.contentType.charAt(0).toUpperCase() + rssAnalysis.contentType.slice(1)}`;
    directive = getRSSMessageDirective(rssAnalysis);

    // Add RSS-specific metadata
    fullContent += `\n\nAdditional Context:\n` +
      `Content Type: ${rssAnalysis.contentType}\n` +
      `Priority: ${rssAnalysis.priority}\n` +
      `Key Topics: ${rssAnalysis.keywords.join(', ')}`;

    metadata = [
      `Source: ${item.metadata.feedTitle || 'RSS Feed'}`,
      `Published: ${new Date(item.date).toLocaleDateString()}`
    ];
  }

  const metadataString = metadata.join('\n');
  const prompt = `${context}\n\nMetadata:\n${metadataString}\n\nDirective:\n${directive}\n\nContent:\n${fullContent}`;

  // Check for prohibited phrases
  console.log('[Message Generation] Checking for prohibited phrases');
  const prohibitedPhrasesFound = PROHIBITED_PHRASES.filter(phrase => 
    prompt.toLowerCase().includes(phrase.toLowerCase())
  );

  if (prohibitedPhrasesFound.length > 0) {
    console.error('[Message Generation] Prohibited phrases detected:', prohibitedPhrasesFound);
    console.error('[Message Generation] Full prompt:', prompt);
    throw new Error(`Content contains prohibited phrases: ${prohibitedPhrasesFound.join(', ')}`);
  }

  // TODO: Replace with actual API call to message generation service
  return new Promise<GeneratedPost>((resolve) => 
    setTimeout(() => {
      resolve({
        content: `Generated insight based on ${context}:\n\nAnalysis of the content shows key discussion points and themes...\n\nRelevant technical aspects include...\n\nKey takeaways:\n1. ...\n2. ...\n3. ...`,
        targetAudiences: ['Engineering', 'Product'],
        sourceItem: item,
        generatedAt: new Date().toISOString()
      });
    }, 2000)
  );
}

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
