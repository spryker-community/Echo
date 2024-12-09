import { Handler } from '@netlify/functions';
import Parser from 'rss-parser';

const parser = new Parser();

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
      const items = feed.items.map((item) => ({
        id: item.guid || item.link || item.title || Math.random().toString(36).substring(7),
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.content || '',
        url: item.link || '',
        date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source: 'rss' as const,
        type: 'rss' as const,
        metadata: {
          feedTitle: feed.title,
          feedDescription: feed.description,
          categories: item.categories || [],
        },
      }));

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
