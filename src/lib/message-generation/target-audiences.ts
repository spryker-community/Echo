import { ContentItem, ForumMetadata, Team } from '../../types';

function getCategoryBasedAudiences(categoryName: string): Team[] {
  switch (categoryName.toLowerCase()) {
    case 'best practices':
      return ['Engineering', 'Architecture'];
    case 'cloud':
      return ['Cloud Operations', 'Engineering'];
    case 'marketplace':
      return ['Product', 'Engineering'];
    case 'community':
      return ['Community Team', 'Partner Success'];
    default:
      return [];
  }
}

function getContentBasedAudiences(content: string): Team[] {
  const audiences: Team[] = [];
  const contentLower = content.toLowerCase();

  if (contentLower.includes('security')) audiences.push('Security');
  if (contentLower.includes('training') || contentLower.includes('learn')) audiences.push('Academy/Training');
  if (contentLower.includes('partner') || contentLower.includes('integration')) audiences.push('Partner Success');
  if (contentLower.includes('customer')) audiences.push('Customer Success');
  if (contentLower.includes('architecture')) audiences.push('Architecture');
  if (contentLower.includes('cloud')) audiences.push('Cloud Operations');
  if (contentLower.includes('symfony') || contentLower.includes('framework')) audiences.push('Architecture');
  if (contentLower.includes('spryker')) {
    audiences.push('Engineering');
    audiences.push('Architecture');
  }

  return audiences;
}

export function determineTargetAudiences(item: ContentItem): Team[] {
  const audiences = new Set<Team>();

  // Add category-based audiences for forum posts
  if (item.source === 'vanilla-forum') {
    const metadata = item.metadata as ForumMetadata;
    if (metadata.categoryName) {
      getCategoryBasedAudiences(metadata.categoryName).forEach(audience => audiences.add(audience));
    }
  }

  // Add content-based audiences
  const contentText = `${item.title} ${item.description}`;
  getContentBasedAudiences(contentText).forEach(audience => audiences.add(audience));

  // Ensure at least one audience
  if (audiences.size === 0) {
    audiences.add('Engineering');
  }

  return Array.from(audiences);
}
