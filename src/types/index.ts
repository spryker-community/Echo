export interface ContentItem {
  id: string;
  source: string;
  type: 'forum' | 'youtube' | 'github' | 'rss';
  title: string;
  description: string;
  url: string;
  date: string;
  image?: string;
  metadata: Record<string, unknown>;
}

export interface GeneratedPost {
  content: string;
  targetAudiences: string[];
  sourceItem: ContentItem;
  generatedAt: string;
}

export interface SourceConfig {
  id: string;
  type: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

export type Team =
  | 'Cloud Operations'
  | 'Customer Success'
  | 'Partner Success'
  | 'Community Team'
  | 'Strategy & Operations'
  | 'Academy/Training'
  | 'Engineering'
  | 'Architecture'
  | 'Sales'
  | 'Marketing'
  | 'Talent Acquisition'
  | 'Product'
  | 'Security'
  | 'Customer Support';