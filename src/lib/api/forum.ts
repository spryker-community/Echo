import axios from 'axios';
import { decodeHtmlEntities } from '../utils';
import type { DiscussionStatus, DiscussionType } from '../../types';

interface ForumUser {
  name: string;
  photoUrl?: string;
}

interface ForumComment {
  commentID: string;
  discussionID: string;
  body: string;
  dateInserted: string;
  insertUser: ForumUser;
}

interface ForumDiscussion {
  discussionID: string;
  name: string;
  body: string;
  dateInserted: string;
  dateLastComment?: string;
  categoryID: number;
  score: number;
  countComments: number;
  insertUser: ForumUser;
  status?: DiscussionStatus;
  type?: DiscussionType;
  solved?: boolean;
  inProgress?: boolean;
  attributes?: {
    status?: string;
    type?: string;
  };
}

export function determineDiscussionStatus(discussion: ForumDiscussion): DiscussionStatus {
  // First check explicit status
  if (discussion.status) return discussion.status;
  
  // Then check attributes
  if (discussion.attributes?.status === 'solved') return 'solved';
  if (discussion.attributes?.status === 'in_progress') return 'in_progress';
  
  // Then check boolean flags
  if (discussion.solved) return 'solved';
  if (discussion.inProgress) return 'in_progress';
  
  // Default to open
  return 'open';
}

export function determineDiscussionType(discussion: ForumDiscussion): DiscussionType {
  // First check explicit type
  if (discussion.type) return discussion.type;
  
  // Then check attributes
  if (discussion.attributes?.type === 'question') return 'question';
  
  // Check title for question indicators
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

  const titleLower = discussion.name.toLowerCase();
  return questionIndicators.some(indicator => titleLower.includes(indicator)) ? 'question' : 'discussion';
}

export async function fetchDiscussionComments(discussionId: string): Promise<ForumComment[]> {
  try {
    console.log('[FORUM API] Fetching comments for discussion:', discussionId);
    
    // Use the correct API v2 endpoint for comments with discussionID filter
    const response = await axios.get<{ data: ForumComment[] }>(
      `${import.meta.env.VITE_FORUM_API_URL}/api/v2/comments`,
      {
        params: {
          discussionID: discussionId
        },
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_FORUM_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    // API v2 wraps responses in a data property
    const comments = response.data.data;
    console.log(`[FORUM API] Fetched ${comments.length} comments for discussion ${discussionId}`);

    return comments.map(comment => ({
      ...comment,
      body: decodeHtmlEntities(comment.body?.replace(/<[^>]*>/g, '') || '')
    }));
  } catch (error) {
    console.error('[FORUM API] Error fetching comments:', error);
    throw error;
  }
}

export async function fetchDiscussions(): Promise<ForumDiscussion[]> {
  try {
    console.log('[FORUM API] Fetching forum discussions');
    
    const response = await axios.get<{ data: ForumDiscussion[] }>(
      `${import.meta.env.VITE_FORUM_API_URL}/api/v2/discussions`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_FORUM_API_KEY}`,
          'Accept': 'application/json'
        }
      }
    );

    // API v2 wraps responses in a data property
    const discussions = response.data.data;
    console.log(`[FORUM API] Fetched ${discussions.length} discussions`);

    return discussions.map(discussion => {
      const status = determineDiscussionStatus(discussion);
      const type = determineDiscussionType(discussion);

      console.log('[FORUM API] Processed discussion:', {
        id: discussion.discussionID,
        title: discussion.name,
        status,
        type,
        comments: discussion.countComments
      });

      return {
        ...discussion,
        body: decodeHtmlEntities(discussion.body?.replace(/<[^>]*>/g, '') || ''),
        status,
        type
      };
    });
  } catch (error) {
    console.error('[FORUM API] Error fetching discussions:', error);
    throw error;
  }
}
