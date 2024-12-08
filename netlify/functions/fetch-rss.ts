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

    console.log(`Fetching RSS feed: ${feedUrl}`);

    try {
      // Fetch and parse the RSS feed
      const feed = await parser.parseURL(feedUrl);
      console.log(`Successfully parsed RSS feed: ${feed.title}`);

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

      console.log(`Transformed ${items.length} items from feed`);

      return {
        statusCode: 200,
        body: JSON.stringify(items),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    } catch (feedError) {
      console.error(`Error parsing RSS feed ${feedUrl}:`, feedError);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to parse RSS feed',
          details: feedError instanceof Error ? feedError.message : String(feedError)
        }),
      };
    }
  } catch (error) {
    console.error('RSS feed handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error processing RSS feed',
        details: error instanceof Error ? error.message : String(error)
      }),
    };
  }
};

export { handler };
