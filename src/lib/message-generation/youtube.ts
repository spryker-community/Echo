// YouTube-specific content analysis helpers
export function extractVideoKeywords(title: string, description: string): string[] {
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

export function analyzeVideoContent(title: string, description: string): { 
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

export function getYouTubeMessageDirective(analysis: ReturnType<typeof analyzeVideoContent>): string {
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
