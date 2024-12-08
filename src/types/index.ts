interface BaseContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  image?: string;
}

interface ForumUser {
  name: string;
  photoUrl?: string;
  url: string;
}

export type DiscussionStatus = 'open' | 'in_progress' | 'solved';
export type DiscussionType = 'question' | 'discussion';

interface ForumMetadata {
  categoryID: number;
  categoryName: string;
  categoryUrl?: string;
  score: number;
  countComments: number;
  format?: string;
  dateLastComment?: string;
  insertUser?: ForumUser;
  lastUser?: ForumUser;
  status?: DiscussionStatus;
  type?: DiscussionType;
}

interface YouTubeMetadata {
  channelTitle: string;
  channelId: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    maxres?: { url: string };
  };
}

interface BlueSkyMetadata {
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  hasImages: boolean;
  imageCount: number;
}

interface ForumContentItem extends BaseContentItem {
  source: 'vanilla-forum';
  type: 'forum';
  metadata: ForumMetadata;
}

interface YouTubeContentItem extends BaseContentItem {
  source: 'youtube' | 'youtube-search';
  type: 'youtube';
  metadata: YouTubeMetadata;
}

interface BlueSkyContentItem extends BaseContentItem {
  source: 'bluesky';
  type: 'social';
  metadata: BlueSkyMetadata;
}

interface GitHubContentItem extends BaseContentItem {
  source: 'github';
  type: 'github';
  metadata: Record<string, unknown>;
}

interface RSSContentItem extends BaseContentItem {
  source: 'rss';
  type: 'rss';
  metadata: Record<string, unknown>;
}

export type ContentItem = ForumContentItem | YouTubeContentItem | GitHubContentItem | RSSContentItem | BlueSkyContentItem;

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
