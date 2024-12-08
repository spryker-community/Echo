import axios from 'axios';

interface BskySession {
  accessJwt: string;
  did: string;
}

interface BskyPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    reply?: {
      root: {
        uri: string;
        cid: string;
      };
      parent: {
        uri: string;
        cid: string;
      };
    };
  };
  embed?: {
    images?: Array<{
      alt?: string;
      fullsize: string;
      thumb: string;
    }>;
  };
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

interface BskySearchResponse {
  cursor?: string;
  hitsTotal: number;
  posts: BskyPost[];
}

interface ThreadPost {
  post: BskyPost;
  parent?: ThreadPost;
  replies?: ThreadPost[];
}

interface BskyThreadResponse {
  thread: ThreadPost;
}

let session: BskySession | null = null;

async function authenticate(): Promise<BskySession> {
  if (session) return session;

  try {
    console.log('[BlueSky API] Authenticating...');
    const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
      identifier: import.meta.env.VITE_BLUESKY_IDENTIFIER,
      password: import.meta.env.VITE_BLUESKY_APP_PASSWORD
    });

    session = {
      accessJwt: response.data.accessJwt,
      did: response.data.did
    };

    console.log('[BlueSky API] Authentication successful');
    return session;
  } catch (error) {
    console.error('[BlueSky API] Authentication failed:', error);
    throw new Error('Failed to authenticate with BlueSky');
  }
}

async function getPostThread(auth: BskySession, uri: string): Promise<BskyThreadResponse | null> {
  try {
    const response = await axios.get<BskyThreadResponse>(
      'https://bsky.social/xrpc/app.bsky.feed.getPostThread',
      {
        params: { uri },
        headers: {
          Authorization: `Bearer ${auth.accessJwt}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.warn('[BlueSky API] Failed to fetch thread for post:', uri, error);
    return null;
  }
}

function postContainsKeyword(post: BskyPost, keyword: string): boolean {
  const content = `${post.record.text} ${post.author.displayName || ''} ${post.author.handle}`.toLowerCase();
  const normalizedKeyword = keyword.toLowerCase();
  
  // Create a regex pattern with word boundaries
  const pattern = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
  const hasKeyword = pattern.test(content);
  
  console.log('[BlueSky API] Checking post for keyword:', {
    keyword: normalizedKeyword,
    postText: post.record.text,
    authorName: post.author.displayName || post.author.handle,
    hasKeyword,
    matches: content.match(pattern)
  });

  return hasKeyword;
}

export async function searchBlueSkyPosts(): Promise<BskyPost[]> {
  try {
    const auth = await authenticate();
    const keywords = import.meta.env.VITE_YOUTUBE_KEYWORDS;

    if (!keywords) {
      console.error('[BlueSky API] Search keywords are missing');
      throw new Error('Search keywords are missing');
    }

    const keywordList: string[] = keywords.split(',').map((k: string) => k.trim());
    console.log('[BlueSky API] Using keywords:', keywordList);

    // Search for each keyword
    const searchPromises = keywordList.map(async (keyword: string) => {
      console.log(`[BlueSky API] Searching for keyword: "${keyword}"`);
      const response = await axios.get<BskySearchResponse>(
        'https://bsky.social/xrpc/app.bsky.feed.searchPosts',
        {
          params: {
            q: keyword,
            limit: 20
          },
          headers: {
            Authorization: `Bearer ${auth.accessJwt}`
          }
        }
      );

      // Double-check each post contains the keyword as a whole word
      const validPosts = response.data.posts.filter(post => postContainsKeyword(post, keyword));
      console.log(`[BlueSky API] Found ${validPosts.length} valid posts for keyword "${keyword}" out of ${response.data.posts.length} total`);
      return validPosts;
    });

    const searchResults = await Promise.all(searchPromises);
    const allPosts = searchResults.flat();
    console.log(`[BlueSky API] Found ${allPosts.length} total posts across all keywords`);

    // Remove duplicates and fetch thread context
    const seenUris = new Set<string>();
    const postsWithContext = await Promise.all(
      allPosts
        .filter(post => {
          if (seenUris.has(post.uri)) {
            console.log('[BlueSky API] Skipping duplicate post:', post.record.text.slice(0, 50));
            return false;
          }
          seenUris.add(post.uri);
          return true;
        })
        .map(async post => {
          // If post is a reply, fetch the thread
          if (post.record.reply) {
            console.log('[BlueSky API] Fetching thread context for:', post.uri);
            const thread = await getPostThread(auth, post.uri);
            if (thread?.thread.parent?.post) {
              console.log('[BlueSky API] Found parent post:', thread.thread.parent.post.record.text.slice(0, 50));
              return {
                ...post,
                threadContext: {
                  parentPost: {
                    text: thread.thread.parent.post.record.text,
                    author: {
                      handle: thread.thread.parent.post.author.handle,
                      displayName: thread.thread.parent.post.author.displayName
                    }
                  }
                }
              };
            }
          }
          return post;
        })
    );

    // Limit to 20 most recent posts
    const recentPosts = postsWithContext
      .sort((a, b) => new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime())
      .slice(0, 20);

    console.log(`[BlueSky API] Returning ${recentPosts.length} unique posts`);
    return recentPosts;
  } catch (error) {
    console.error('[BlueSky API] Search failed:', error);
    throw error;
  }
}

export function getBskyProfileUrl(handle: string): string {
  return `https://bsky.app/profile/${handle}`;
}

export function getBskyPostUrl(uri: string): string {
  // Convert AT URI to web URL
  // Example: at://did:plc:xyz/app.bsky.feed.post/tid -> https://bsky.app/profile/did:plc:xyz/post/tid
  const match = uri.match(/at:\/\/(did:[^/]+)\/([^/]+)\/(.+)/);
  if (!match) return '#';
  const [, did, , tid] = match;
  return `https://bsky.app/profile/${did}/post/${tid}`;
}
