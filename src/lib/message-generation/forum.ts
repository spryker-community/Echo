// Forum-specific content analysis helpers
export function isQuestionType(title: string, body: string): boolean {
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

export function getMessageDirective(status: 'open' | 'in_progress' | 'solved' | undefined, isQuestion: boolean): string {
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

export async function processForumContent(
  item: {
    id: string;
    title: string;
    description: string;
    metadata: {
      status?: 'open' | 'in_progress' | 'solved';
      countComments: number;
      categoryName: string;
      insertUser?: { name: string };
      dateLastComment?: string;
    };
  },
  fetchComments: (id: string) => Promise<Array<{ insertUser: { name: string }, body: string }>>,
  showWarning: (message: string) => void
): Promise<{
  fullContent: string;
  context: string;
  directive: string;
  metadata: string[];
}> {
  let fullContent = `Original Post:\n${item.description}`;
  
  // Determine if it's a question and its status
  const isQuestion = isQuestionType(item.title, item.description);
  const status = item.metadata.status;

  const directive = getMessageDirective(status, isQuestion);
  let context = isQuestion ? `${status?.toUpperCase() || 'OPEN'} Question` : 'Forum Discussion';

  if (item.metadata.countComments > 0) {
    try {
      console.log('[Message Generation] Fetching comments for discussion:', item.id);
      const comments = await fetchComments(item.id);
      
      // Add comments to the content if available
      if (comments && comments.length > 0) {
        const commentsContent = comments
          .filter(comment => comment && comment.insertUser)
          .map(comment => `Comment by ${comment.insertUser.name}:\n${comment.body}`)
          .join('\n\n');
        
        if (commentsContent) {
          fullContent += `\n\nDiscussion Comments:\n${commentsContent}`;
          context = `${context} with ${comments.length} comments`;
        }
      }
    } catch (error) {
      console.error('[Message Generation] Error fetching comments:', error);
      // Show warning but continue with generation
      showWarning('Could not fetch discussion comments. Proceeding with available context.');
      // Continue with the original content
    }
  }

  // Prepare metadata
  const metadata: string[] = [];
  
  metadata.push(`Category: ${item.metadata.categoryName}`);
  metadata.push(`Author: ${item.metadata.insertUser?.name || 'Anonymous'}`);
  metadata.push(`Comments: ${item.metadata.countComments}`);
  metadata.push(`Status: ${item.metadata.status || 'open'}`);
  
  if (item.metadata.dateLastComment) {
    metadata.push(`Last Activity: ${new Date(item.metadata.dateLastComment).toLocaleDateString()}`);
  }

  return {
    fullContent,
    context,
    directive,
    metadata
  };
}
