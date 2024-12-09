import { Handler } from '@netlify/functions';
import Parser from 'rss-parser';

const parser = new Parser();

// Function to strip HTML tags and decode HTML entities
function cleanHtml(html: string): string {
  // First decode HTML entities
  const decoded = html.replace(/&lt;/g, '<')
                     .replace(/&gt;/g, '>')
                     .replace(/&amp;/g, '&')
                     .replace(/&quot;/g, '"')
                     .replace(/&#39;/g, "'")
                     .replace(/&nbsp;/g, ' ');
  
  // Then remove HTML tags
  return decoded.replace(/<[^>]*>/g, '').trim();
}

// Function to extract domain from URL
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove 'www.' if present and get the hostname
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    console.error(`[DEBUG] Error extracting domain from URL ${url}:`, e);
    return 'Unknown Source';
  }
}

const handler: Handler = async (event) => {
  try {
    // Get feed URL from query parameters
    const feedUrl = event.queryStringParameters?.url;
    
    if (!feedUrl) {
      console.error('RSS feed URL is missing');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Feed URL is required' }),
      };
    }

    console.log(`[DEBUG] Starting RSS fetch for URL: ${feedUrl}`);
    console.log(`[DEBUG] Full event object:`, JSON.stringify(event, null, 2));

    try {
      // Log the attempt to fetch
      console.log(`[DEBUG] Attempting to fetch and parse RSS feed from: ${feedUrl}`);

      // Fetch and parse the RSS feed
      const feed = await parser.parseURL(feedUrl);
      console.log(`[DEBUG] Successfully parsed RSS feed: ${feed.title}`);
      console.log(`[DEBUG] Feed metadata:`, JSON.stringify({
        title: feed.title,
        description: feed.description,
        itemCount: feed.items.length
      }, null, 2));

      // Transform feed items to match our content structure
      const items = feed.items.map((item) => {
        const itemUrl = item.link || '';
        const sourceDomain = extractDomain(itemUrl);

        return {
          id: item.guid || itemUrl || item.title || Math.random().toString(36).substring(7),
          title: cleanHtml(item.title || 'Untitled'),
          description: cleanHtml(item.contentSnippet || item.content || ''),
          url: itemUrl,
          date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: 'rss' as const,
          type: 'rss' as const,
          metadata: {
            feedTitle: sourceDomain, // Use the domain as the feedTitle
            feedDescription: cleanHtml(feed.description || ''),
            categories: item.categories?.map(cleanHtml) || [],
            originalFeedTitle: cleanHtml(feed.title || '') // Keep original feed title as reference
          },
        };
      });

      console.log(`[DEBUG] Successfully transformed ${items.length} items from feed`);

      return {
        statusCode: 200,
        body: JSON.stringify(items),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      };
    } catch (feedError) {
      console.error(`[DEBUG] Error details for RSS feed ${feedUrl}:`, {
        error: feedError instanceof Error ? {
          name: feedError.name,
          message: feedError.message,
          stack: feedError.stack
        } : feedError
      });
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to parse RSS feed',
          details: feedError instanceof Error ? feedError.message : String(feedError)
        }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        },
      };
    }
  } catch (error) {
    console.error('[DEBUG] General handler error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error processing RSS feed',
        details: error instanceof Error ? error.message : String(error)
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    };
  }
};

export { handler };
