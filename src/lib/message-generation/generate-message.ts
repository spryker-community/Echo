import { ContentItem, ForumMetadata, YouTubeMetadata, RSSMetadata, BlueSkyMetadata, GeneratedPost } from '../../types';
import { processForumContent } from './forum';
import { analyzeVideoContent, getYouTubeMessageDirective } from './youtube';
import { analyzeRSSContent, getRSSMessageDirective } from './rss';
import { generateBlueSkyMessage } from './bluesky';
import { determineTargetAudiences } from './target-audiences';
import { fetchDiscussionComments } from '../api/forum';
import { generatePost } from '../api/message';

function generateMockMessage(item: ContentItem, context: string): string {
  switch (item.source) {
    case 'vanilla-forum': {
      const metadata = item.metadata as ForumMetadata;
      if (metadata.type === 'question') {
        return `🔧 Hey Engineering team! ${metadata.insertUser?.name || 'A community member'} needs our input on ${item.title.toLowerCase()} - looks like something we dealt with in the platform recently. ${item.url}`;
      }
      return `💡 Architecture team: Interesting approach to ${item.title.toLowerCase()} in the ${metadata.categoryName} category that aligns with our current initiatives. ${item.url}`;
    }

    case 'youtube':
    case 'youtube-search': {
      const metadata = item.metadata as YouTubeMetadata;
      return `🎥 Product team: ${metadata.channelTitle} just covered some features we're planning - great market validation! ${item.url}`;
    }

    case 'rss': {
      const metadata = item.metadata as RSSMetadata;
      return `📰 Cloud Ops: This ${metadata.feedTitle} article addresses that scaling challenge we discussed in standup. ${item.url}`;
    }

    case 'bluesky': {
      const metadata = item.metadata as BlueSkyMetadata;
      return `🔍 Hey Architecture team! ${metadata.author.name} shares some insights about PHP frameworks that could help with our current modernization efforts. ${item.url}`;
    }

    default:
      return `📢 Team, this directly relates to our current sprint goals: ${item.title} ${item.url}`;
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

  // Determine target audiences
  const targetAudiences = determineTargetAudiences(item);

  // Generate the message using the OpenRouter API
  const content = await generatePost(item, targetAudiences);

  return {
    content,
    targetAudiences,
    sourceItem: item,
    generatedAt: new Date().toISOString()
  };
}
