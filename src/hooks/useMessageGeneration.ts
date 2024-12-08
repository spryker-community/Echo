import { useMutation } from '@tanstack/react-query';
import { ContentItem, GeneratedPost } from '../types';
import { fetchDiscussionComments } from '../lib/api/forum';
import { useToast } from './useToast';
import { PROHIBITED_PHRASES, isContentProhibited } from '../config/prohibited-phrases';

// YouTube-specific content analysis helpers
function extractVideoKeywords(title: string, description: string): string[] {
  const keywords = new Set<string>();
  const combinedText = `${title} ${description}`.toLowerCase();
  
  const techKeywords = [
    'tutorial', 'guide', 'how to', 'review', 'explained', 
    'introduction', 'deep dive', 'overview', 'tips', 'tricks', 
    'best practices', 'advanced', 'beginner', 'intermediate'
  ];

  const domainKeywords = [
    'programming', 'software', 'development', 'tech', 'coding', 
    'web', 'mobile', 'cloud', 'ai', 'machine learning', 
    'data science', 'cybersecurity', 'blockchain'
  ];

  techKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) keywords.add(keyword);
  });

  domainKeywords.forEach(keyword => {
    if (combinedText.includes(keyword)) keywords.add(keyword);
  });

  return Array.from(keywords);
}

function analyzeVideoContent(title: string, description: string): { 
  contentType: string, 
  complexity: 'beginner' | 'intermediate' | 'advanced',
  keywords: string[]
} {
  const keywords = extractVideoKeywords(title, description);

  let complexity: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
  if (keywords.includes('advanced')) complexity = 'advanced';
  else if (keywords.includes('intermediate')) complexity = 'intermediate';

  const contentType = keywords.includes('tutorial') ? 'Tutorial' :
                      keywords.includes('review') ? 'Review' :
                      keywords.includes('guide') ? 'Guide' : 
                      'Informational';

  return { contentType, complexity, keywords };
}

// RSS-specific content analysis helpers
function analyzeRSSContent(title: string, content: string): {
  contentType: 'news' | 'announcement' | 'release' | 'update' | 'general',
  priority: 'high' | 'medium' | 'low',
  keywords: string[]
} {
  const combinedText = `${title} ${content}`.toLowerCase();
  const keywords = new Set<string>();

  // Extract keywords based on content patterns
  const keywordPatterns = [
    'release', 'update', 'announcement', 'news', 'feature',
    'improvement', 'fix', 'security', 'performance', 'enhancement',
    'breaking change', 'deprecation', 'new version'
  ];

  keywordPatterns.forEach(keyword => {
    if (combinedText.includes(keyword)) keywords.add(keyword);
  });

  // Determine content type
  let contentType: 'news' | 'announcement' | 'release' | 'update' | 'general' = 'general';
  if (combinedText.includes('release') || combinedText.includes('version')) {
    contentType = 'release';
  } else if (combinedText.includes('announcement')) {
    contentType = 'announcement';
  } else if (combinedText.includes('update')) {
    contentType = 'update';
  } else if (combinedText.includes('news')) {
    contentType = 'news';
  }

  // Determine priority
  let priority: 'high' | 'medium' | 'low' = 'medium';
  const highPriorityTerms = ['security', 'breaking change', 'critical', 'urgent'];
  const lowPriorityTerms = ['minor', 'patch', 'documentation'];

  if (highPriorityTerms.some(term => combinedText.includes(term))) {
    priority = 'high';
  } else if (lowPriorityTerms.some(term => combinedText.includes(term))) {
    priority = 'low';
  }

  return {
    contentType,
    priority,
    keywords: Array.from(keywords)
  };
}

function getRSSMessageDirective(analysis: ReturnType<typeof analyzeRSSContent>): string {
  const priorityContext = analysis.priority === 'high' ? 
    'This is a high-priority update requiring immediate attention.' :
    analysis.priority === 'low' ? 
    'This is a routine update for general awareness.' :
    'This update contains noteworthy information for consideration.';

  switch (analysis.contentType) {
    case 'release':
      return `${priorityContext} Summarize the key changes, improvements, and impacts of this release. Focus on technical details and any required actions.`;
    case 'announcement':
      return `${priorityContext} Provide a clear overview of this announcement, highlighting its significance and any implications for different teams.`;
    case 'update':
      return `${priorityContext} Break down the important aspects of this update, including any changes to workflows or systems.`;
    case 'news':
      return `${priorityContext} Analyze this news item's relevance to our organization and highlight key points of interest.`;
    default:
      return `${priorityContext} Extract the most relevant information and identify any actionable insights.`;
  }
}

function getYouTubeMessageDirective(analysis: ReturnType<typeof analyzeVideoContent>): string {
  switch (analysis.contentType) {
    case 'Tutorial':
      return `Provide a comprehensive summary of this ${analysis.complexity} level tutorial. Highlight key learning points, technical details, and practical applications.`;
    case 'Review':
      return `Analyze this video review, focusing on technical insights, pros and cons, and potential relevance to professional contexts.`;
    case 'Guide':
      return `Break down this ${analysis.complexity} level guide. Extract actionable insights, best practices, and critical takeaways.`;
    default:
      return `Generate an informative summary of this video content, emphasizing technical relevance and potential professional applications.`;
  }
}

function getMessageDirective(status: 'open' | 'in_progress' | 'solved' | undefined, isQuestion: boolean): string {
  if (!isQuestion) return 'Provide an informative summary of this discussion.';

  switch (status) {
    case 'open':
      return 'This is an open question that needs attention. Focus on alerting internal employees about the help needed and what expertise might be required to assist. Highlight any specific technical details or requirements mentioned in the question.';
    case 'in_progress':
      return 'This question is being worked on. Summarize the current progress, any solutions being attempted, and highlight any additional expertise that might be helpful. Include any technical challenges or blockers mentioned.';
    case 'solved':
      return 'This question has been solved. Focus on the solution provided, any key learnings, and additional context that might be valuable for similar situations. Highlight the technical aspects of the solution and any best practices discussed.';
    default:
      return 'Analyze this question and determine what expertise is needed to provide assistance. Focus on technical details and requirements.';
  }
}

function isQuestionType(title: string, body: string): boolean {
  const questionIndicators = [
    '?',
    'how to',
    'how do',
    'what is',
    'what are',
    'why does',
    'can i',
    'possible to',
    'help with',
    'issue with',
    'problem with',
    'error',
    'trouble',
    'stuck',
    'not working',
    'failed',
    'unable to'
  ];

  const contentLower = `${title} ${body}`.toLowerCase();
  return questionIndicators.some(indicator => contentLower.includes(indicator));
}

async function generateMessageForItem(item: ContentItem): Promise<GeneratedPost> {
  // Prepare content based on source type
  let fullContent = '';
  let context = '';
  let directive = '';

  if (item.source === 'vanilla-forum') {
    // For forum posts, include the original post and any comments
    fullContent = `Original Post:\n${item.description}`;
    
    // Determine if it's a question and its status
    const isQuestion = isQuestionType(item.title, item.description);
    const status = item.metadata.status;

    directive = getMessageDirective(status, isQuestion);
    context = isQuestion ? `${status?.toUpperCase() || 'OPEN'} Question` : 'Forum Discussion';

    if (item.metadata.countComments > 0) {
      try {
        console.log('[Message Generation] Fetching comments for discussion:', item.id);
        const comments = await fetchDiscussionComments(item.id);
        
        // Add comments to the content
        const commentsContent = comments
          .map(comment => `Comment by ${comment.insertUser.name}:\n${comment.body}`)
          .join('\n\n');
        
        fullContent += `\n\nDiscussion Comments:\n${commentsContent}`;
        context = `${context} with ${comments.length} comments`;
      } catch (error) {
        console.error('[Message Generation] Error fetching comments:', error);
        throw new Error('Could not fetch all comments for complete context');
      }
    }
  } else if (item.source === 'youtube') {
    // Enhanced YouTube video handling
    const videoAnalysis = analyzeVideoContent(item.title, item.description);
    
    fullContent = `Video Title: ${item.title}\n\nDescription:\n${item.description}`;
    context = `YouTube ${videoAnalysis.contentType} Video`;
    directive = getYouTubeMessageDirective(videoAnalysis);

    // Add video-specific metadata
    fullContent += `\n\nAdditional Context:\n` +
      `Content Type: ${videoAnalysis.contentType}\n` +
      `Complexity Level: ${videoAnalysis.complexity}\n` +
      `Key Topics: ${videoAnalysis.keywords.join(', ')}`;
  } else if (item.source === 'rss') {
    // RSS content handling
    const rssAnalysis = analyzeRSSContent(item.title, item.description);
    
    fullContent = `Title: ${item.title}\n\nContent:\n${item.description}`;
    context = `RSS ${rssAnalysis.contentType.charAt(0).toUpperCase() + rssAnalysis.contentType.slice(1)}`;
    directive = getRSSMessageDirective(rssAnalysis);

    // Add RSS-specific metadata
    fullContent += `\n\nAdditional Context:\n` +
      `Content Type: ${rssAnalysis.contentType}\n` +
      `Priority: ${rssAnalysis.priority}\n` +
      `Key Topics: ${rssAnalysis.keywords.join(', ')}`;
  }

  // Add metadata context
  const metadata = [];
  if (item.source === 'vanilla-forum') {
    metadata.push(
      `Category: ${item.metadata.categoryName}`,
      `Author: ${item.metadata.insertUser?.name || 'Anonymous'}`,
      `Comments: ${item.metadata.countComments}`,
      `Status: ${item.metadata.status || 'open'}`,
      item.metadata.dateLastComment ? 
        `Last Activity: ${new Date(item.metadata.dateLastComment).toLocaleDateString()}` : 
        undefined
    );
  } else if (item.source === 'youtube') {
    metadata.push(
      `Channel: ${item.metadata.channelTitle}`,
      `Published: ${new Date(item.date).toLocaleDateString()}`
    );
  } else if (item.source === 'rss') {
    metadata.push(
      `Source: ${item.metadata.feedTitle || 'RSS Feed'}`,
      `Published: ${new Date(item.date).toLocaleDateString()}`
    );
  }

  const metadataString = metadata.filter(Boolean).join('\n');
  const prompt = `${context}\n\nMetadata:\n${metadataString}\n\nDirective:\n${directive}\n\nContent:\n${fullContent}`;

  // Detailed prohibited phrase checking with verbose logging
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
    mutationFn: generateMessageForItem,
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
