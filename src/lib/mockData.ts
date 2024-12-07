import { ContentItem } from '../types';

export const mockItems: ContentItem[] = [
  {
    id: '1',
    source: 'vanilla-forum',
    type: 'forum',
    title: 'New Feature Discussion: Spryker B2B Suite',
    description: 'Exciting discussion about the latest features in Spryker B2B Suite. Join us to share your thoughts!',
    url: 'https://forum.commercequest.space/discussion/1',
    date: '2024-01-20T10:00:00Z',
    metadata: {
      categoryID: 1,
      score: 5,
      countComments: 12,
    },
  },
  {
    id: '2',
    source: 'youtube',
    type: 'youtube',
    title: 'Spryker Commerce OS Tutorial',
    description: 'Learn how to set up and customize your Spryker Commerce OS installation.',
    url: 'https://youtube.com/watch?v=123',
    date: '2024-01-19T15:30:00Z',
    image: 'https://picsum.photos/400/225',
    metadata: {
      channelTitle: 'Spryker',
      thumbnails: {
        medium: { url: 'https://picsum.photos/400/225' },
      },
    },
  },
];