interface BaseContentItem {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  image?: string;
}

export interface ForumUser {
  name: string;
  photoUrl?: string;
  url: string;
}

export type DiscussionStatus = 'open' | 'in_progress' | 'solved';
export type DiscussionType = 'question' | 'discussion';

export interface ForumMetadata {
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

export interface YouTubeMetadata {
  channelTitle: string;
  channelId: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
    maxres?: { url: string };
  };
}

export interface BlueSkyMetadata {
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  hasImages: boolean;
  imageCount: number;
  threadContext?: {
    parentPost?: {
      text: string;
      author: {
        handle: string;
        displayName?: string;
      };
    };
  };
}

export interface RSSMetadata {
  feedTitle: string;
  feedDescription?: string;
  categories?: string[];
}

export interface GartnerMetadata {
  rating: string;
  reviewer: {
    role?: string;
    industry?: string;
    company?: string;
    size?: string;
  };
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
  metadata: RSSMetadata;
}

interface GartnerContentItem extends BaseContentItem {
  source: 'gartner';
  type: 'review';
  metadata: GartnerMetadata;
}

export type ContentItem = ForumContentItem | YouTubeContentItem | GitHubContentItem | RSSContentItem | BlueSkyContentItem | GartnerContentItem;

export interface GeneratedPost {
  content: string;
  targetAudiences: string[];
  sourceItem: ContentItem;
  generatedAt: string;
}

export type SourceType = 'forum' | 'youtube' | 'youtube-search' | 'social' | 'github' | 'rss' | 'review';

export interface BaseSourceConfig {
  id: string;
  type: SourceType;
  url: string;
  apiKey?: string;
  enabled: boolean;
}

export interface RSSSourceConfig extends BaseSourceConfig {
  type: 'rss';
  name: string;
}

export type SourceConfig = BaseSourceConfig | RSSSourceConfig;

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
