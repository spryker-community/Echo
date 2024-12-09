import { ContentItem, ForumMetadata, YouTubeMetadata, RSSMetadata, GeneratedPost } from '../../types';
import { processForumContent } from './forum';
import { analyzeVideoContent, getYouTubeMessageDirective } from './youtube';
import { analyzeRSSContent, getRSSMessageDirective } from './rss';
import { generateBlueSkyMessage } from './bluesky';
import { determineTargetAudiences } from './target-audiences';
import { fetchDiscussionComments } from '../api/forum';
import { generatePost } from '../api/message';

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
