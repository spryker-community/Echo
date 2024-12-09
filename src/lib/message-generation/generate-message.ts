import { ContentItem, ForumMetadata, YouTubeMetadata, RSSMetadata, GeneratedPost } from '../../types';
import { processForumContent } from './forum';
import { analyzeVideoContent, getYouTubeMessageDirective } from './youtube';
import { analyzeRSSContent, getRSSMessageDirective } from './rss';
import { generateBlueSkyMessage } from './bluesky';
import { determineTargetAudiences } from './target-audiences';
import { fetchDiscussionComments } from '../api/forum';

function generateMockMessage(item: ContentItem, context: string): string {
  switch (item.source) {
    case 'vanilla-forum': {
      const metadata = item.metadata as ForumMetadata;
      if (metadata.type === 'question') {
        return `Hey team! 👋 Check out this ${metadata.status || 'open'} question about ${item.title.toLowerCase()} :nerd_face: ${metadata.insertUser?.name || 'A community member'} is looking for help. Might be relevant for our ${metadata.categoryName} folks! ${item.url}`;
      }
      return `Interesting discussion in our forum about ${item.title.toLowerCase()} :thinking: ${metadata.insertUser?.name || 'A community member'} shared some insights in the ${metadata.categoryName} category. Worth checking out! ${item.url}`;
    }

    case 'youtube':
    case 'youtube-search': {
      const metadata = item.metadata as YouTubeMetadata;
      return `New video alert! 🎥 ${metadata.channelTitle} just posted "${item.title}". Great content for anyone interested in ${item.description.split('.')[0].toLowerCase()}! ${item.url}`;
    }

    case 'rss': {
      const metadata = item.metadata as RSSMetadata;
      return `📰 ${metadata.feedTitle || 'News update'}: ${item.title}. ${item.description.split('.')[0]}. Check it out: ${item.url}`;
    }

    case 'bluesky': {
      return generateBlueSkyMessage(item.description, item.metadata, item.url);
    }

    default:
      return `Check out this interesting update: ${item.title} ${item.url}`;
  }
}

export async function generateMessageForItem(
  item: ContentItem,
  showWarning: (message: string) => void
): Promise<GeneratedPost> {
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
    const youtubeMetadata = item.metadata as YouTubeMetadata;
    
    fullContent = `Video Title: ${item.title}\n\nDescription:\n${item.description}`;
    context = `YouTube ${videoAnalysis.contentType} Video`;
    directive = getYouTubeMessageDirective(videoAnalysis);

    metadata = [
      `Channel: ${youtubeMetadata.channelTitle}`,
      `Published: ${new Date(item.date).toLocaleDateString()}`
    ];
  } else if (item.source === 'rss') {
    const rssAnalysis = analyzeRSSContent(item.title, item.description);
    const rssMetadata = item.metadata as RSSMetadata;
    
    fullContent = `Title: ${item.title}\n\nContent:\n${item.description}`;
    context = `RSS ${rssAnalysis.contentType.charAt(0).toUpperCase() + rssAnalysis.contentType.slice(1)}`;
    directive = getRSSMessageDirective(rssAnalysis);

    metadata = [
      `Source: ${rssMetadata.feedTitle || 'RSS Feed'}`,
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
6. Write the message directly, without any introductions or sections
7. Use the style of these examples:
   - "A community member posted some nice lines about X :) Check it out: [url]"
   - "We have been mentioned in a report that analyzed X :muscle: [url]"
   - "Hi fellow Sprykees! :heart_hands: Here's an interesting discussion about X [url]"
`;

  const prompt = `${context}\n\nMetadata:\n${metadataString}\n\n${instructions}\n\nContent:\n${fullContent}`;

  // TODO: Replace with actual API call to message generation service
  return {
    content: generateMockMessage(item, context),
    targetAudiences: determineTargetAudiences(item),
    sourceItem: item,
    generatedAt: new Date().toISOString()
  };
}
