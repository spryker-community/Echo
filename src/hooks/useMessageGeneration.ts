import { useMutation } from '@tanstack/react-query';
import { ContentItem, GeneratedPost } from '../types';
import { fetchDiscussionComments } from '../lib/api/forum';
import { useToast } from './useToast';

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
    // For YouTube videos, include title and description
    fullContent = `Video Title: ${item.title}\n\nDescription:\n${item.description}`;
    context = 'YouTube Video';
    directive = 'Provide an informative summary of this video content, focusing on technical details and key learnings that would be valuable for the team.';
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
  }

  const metadataString = metadata.filter(Boolean).join('\n');
  const prompt = `${context}\n\nMetadata:\n${metadataString}\n\nDirective:\n${directive}\n\nContent:\n${fullContent}`;

  console.log('[Message Generation] Preparing prompt:', {
    context,
    directive,
    contentLength: fullContent.length,
    hasComments: item.source === 'vanilla-forum' && item.metadata.countComments > 0
  });

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
        description: error instanceof Error ? error.message : 'Failed to generate insight. Please try again.',
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
