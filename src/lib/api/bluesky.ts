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
  };
  embed?: {
    images?: Array<{
      alt?: string;
      fullsize: string;
      thumb: string;
    }>;
  };
}

interface BskySearchResponse {
  cursor?: string;
  hitsTotal: number;
  posts: BskyPost[];
}

let session: BskySession | null = null;

async function authenticate(identifier?: string, password?: string): Promise<BskySession> {
  if (session) return session;

  try {
    console.log('[BlueSky API] Authenticating...');
    
    // Use provided credentials or fall back to env vars
    const bskyIdentifier = identifier || process.env.VITE_BLUESKY_IDENTIFIER || import.meta.env.VITE_BLUESKY_IDENTIFIER;
    const bskyPassword = password || process.env.VITE_BLUESKY_APP_PASSWORD || import.meta.env.VITE_BLUESKY_APP_PASSWORD;

    if (!bskyIdentifier || !bskyPassword) {
      throw new Error('BlueSky credentials are missing');
    }

    const response = await axios.post('https://bsky.social/xrpc/com.atproto.server.createSession', {
      identifier: bskyIdentifier,
      password: bskyPassword
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

export async function searchBlueSkyPosts(keywords?: string): Promise<BskyPost[]> {
  try {
    const auth = await authenticate();
    const searchKeywords = keywords || process.env.VITE_YOUTUBE_KEYWORDS || import.meta.env.VITE_YOUTUBE_KEYWORDS;

    if (!searchKeywords) {
      console.error('[BlueSky API] Search keywords are missing');
      throw new Error('Search keywords are missing');
    }

    const keywordList: string[] = searchKeywords.split(',').map((k: string) => k.trim());
    console.log('[BlueSky API] Searching for keywords:', keywordList);

    // Search for each keyword
    const searchPromises = keywordList.map(async (keyword: string) => {
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

      return response.data.posts;
    });

    const searchResults = await Promise.all(searchPromises);
    const allPosts = searchResults.flat();
    console.log(`[BlueSky API] Found ${allPosts.length} total posts`);

    // Remove duplicates
    const seenUris = new Set<string>();
    const uniquePosts = allPosts.filter(post => {
      if (seenUris.has(post.uri)) {
        console.log('[BlueSky API] Skipping duplicate post:', post.record.text.slice(0, 50));
        return false;
      }
      seenUris.add(post.uri);
      return true;
    });

    // Limit to 20 most recent posts
    const recentPosts = uniquePosts
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
