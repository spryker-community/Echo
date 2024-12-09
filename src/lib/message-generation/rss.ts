// RSS-specific content analysis helpers
export function analyzeRSSContent(title: string, content: string): {
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

export function getRSSMessageDirective(analysis: ReturnType<typeof analyzeRSSContent>): string {
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
