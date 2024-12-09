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

  // Instructions for the AI
  const instructions = `
Instructions:
1. Write a brief, engaging message about this content for internal communication
2. Use a natural, conversational tone
3. Include relevant emojis to make the message engaging
4. Always include the URL or source reference
5. Keep it concise and to the point
6. Do not use any of these phrases: ${PROHIBITED_PHRASES.join(', ')}
7. Write the message directly, without any introductions or sections
8. Use the style of these examples:
   - "A community member posted some nice lines about X :) Check it out: [url]"
   - "We have been mentioned in a report that analyzed X :muscle: [url]"
   - "Hi fellow Sprykees! :heart_hands: Here's an interesting discussion about X [url]"
`;

  const prompt = `${context}\n\nMetadata:\n${metadataString}\n\n${instructions}\n\nContent:\n${fullContent}`;

  // TODO: Replace with actual API call to message generation service
  return new Promise<GeneratedPost>((resolve) => 
    setTimeout(() => {
      resolve({
        content: "Hey team! Check out this interesting discussion about database management in our forum :nerd_face: A community member is looking for tips on handling large DB structures with git branches. Might be relevant for our Cloud Ops and Engineering teams! :rocket: https://forum.commercequest.space/discussion/123",
        targetAudiences: ['Engineering', 'Cloud Operations'],
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
