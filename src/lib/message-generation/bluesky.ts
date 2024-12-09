import { BlueSkyMetadata } from '../../types';

function extractFrameworks(content: string): string[] {
  const frameworks = [];
  if (content.includes('itk')) frameworks.push('ITK');
  if (content.includes('symfony')) frameworks.push('Symfony');
  if (content.includes('laravel')) frameworks.push('Laravel');
  if (content.includes('zend')) frameworks.push('Zend');
  if (content.includes('yii')) frameworks.push('Yii');
  if (content.includes('spryker')) frameworks.push('Spryker');
  if (content.includes('code igniter')) frameworks.push('Code Igniter');
  return frameworks;
}

function analyzeFrameworkContext(currentFrameworks: string[], previousFrameworks: string[]): string {
  const allFrameworks = [...new Set([...currentFrameworks, ...previousFrameworks])];
  
  if (!allFrameworks.includes('Spryker')) {
    return allFrameworks.length > 0 
      ? `Developer sharing their PHP framework journey through ${allFrameworks.join(', ')}`
      : '';
  }

  const hasSymfony = allFrameworks.includes('Symfony');
  const sprykerIndex = currentFrameworks.indexOf('Spryker');
  const beforeSpryker = sprykerIndex > -1 ? currentFrameworks.slice(0, sprykerIndex) : previousFrameworks;

  if (beforeSpryker.length > 0) {
    let insight = `Interesting to see a developer's journey through ${beforeSpryker.join(', ')} before adopting Spryker`;
    if (hasSymfony) {
      insight += '. Their Symfony background provides valuable context about their Spryker experience';
    }
    return insight;
  }

  if (hasSymfony) {
    return 'Nice perspective on Spryker\'s relationship with Symfony';
  }

  return 'Developer sharing their Spryker experience';
}

function analyzeThreadContext(parentPost: { text: string; author: { handle: string; displayName?: string } }): {
  frameworks: string[];
  isComparison: boolean;
  authorContext?: string;
} {
  const frameworks = extractFrameworks(parentPost.text.toLowerCase());
  const text = parentPost.text.toLowerCase();
  
  // Check if the parent post is comparing frameworks
  const isComparison = text.includes('vs') || 
                      text.includes('versus') || 
                      text.includes('compared to') ||
                      text.includes('better than') ||
                      text.includes('prefer') ||
                      text.includes('switched from');

  // Extract author context if relevant
  let authorContext;
  if (parentPost.author.displayName) {
    if (text.includes('experience') || text.includes('worked with') || text.includes('using')) {
      authorContext = `${parentPost.author.displayName}'s experience`;
    }
  }

  return { frameworks, isComparison, authorContext };
}

export function generateBlueSkyMessage(
  content: string,
  metadata: BlueSkyMetadata,
  url: string
): string {
  const currentFrameworks = extractFrameworks(content.toLowerCase());
  let threadContext = '';
  let insight = '';

  // Analyze thread context if available
  if (metadata.threadContext?.parentPost) {
    const { frameworks: parentFrameworks, isComparison, authorContext } = 
      analyzeThreadContext(metadata.threadContext.parentPost);
    
    insight = analyzeFrameworkContext(currentFrameworks, parentFrameworks);

    if (isComparison) {
      threadContext = ' This comes from an interesting discussion comparing different PHP frameworks';
      if (parentFrameworks.includes('spryker') || currentFrameworks.includes('Spryker')) {
        threadContext += ', including Spryker';
      }
      if (authorContext) {
        threadContext += `, building on ${authorContext}`;
      }
      threadContext += '.';
    } else if (parentFrameworks.length > 0) {
      threadContext = ` Part of a broader discussion about PHP frameworks`;
      if (parentFrameworks.includes('spryker')) {
        threadContext += ', with specific focus on Spryker';
      }
      if (authorContext) {
        threadContext += `, including ${authorContext}`;
      }
      threadContext += '.';
    }
  } else {
    insight = analyzeFrameworkContext(currentFrameworks, []);
  }

  // Create message with enhanced context
  let message = `Hey Architecture team! 🛠️ Found an interesting tech perspective from ${metadata.author.name}. `;
  
  if (insight) {
    message += insight;
  }
  
  if (threadContext) {
    message += threadContext;
  }
  
  message += ` Great insights for understanding developer experiences with our ecosystem! ${url}`;

  return message;
}
