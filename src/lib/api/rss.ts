import { ContentItem } from '../../types';

// Get RSS feed URLs from environment variables
const RSS_FEEDS = [
  {
    name: import.meta.env.VITE_RSS_FEED_1_NAME,
    url: import.meta.env.VITE_RSS_FEED_1_URL
  },
  {
    name: import.meta.env.VITE_RSS_FEED_2_NAME,
    url: import.meta.env.VITE_RSS_FEED_2_URL
  },
  {
    name: import.meta.env.VITE_RSS_FEED_3_NAME,
    url: import.meta.env.VITE_RSS_FEED_3_URL
  }
].filter(feed => feed.url && feed.name);

export async function fetchRSSFeeds(): Promise<ContentItem[]> {
  try {
    // Check if RSS feeds are configured
    if (RSS_FEEDS.length === 0) {
      console.info('[RSS] No RSS feeds configured');
      console.debug('[RSS] Environment variables:', {
        FEED_1: {
          name: import.meta.env.VITE_RSS_FEED_1_NAME,
          url: import.meta.env.VITE_RSS_FEED_1_URL
        },
        FEED_2: {
          name: import.meta.env.VITE_RSS_FEED_2_NAME,
          url: import.meta.env.VITE_RSS_FEED_2_URL
        },
        FEED_3: {
          name: import.meta.env.VITE_RSS_FEED_3_NAME,
          url: import.meta.env.VITE_RSS_FEED_3_URL
        }
      });
      return [];
    }

    console.info('[RSS] Configured feeds:', RSS_FEEDS.map(f => ({ name: f.name, url: f.url })));

    // Fetch all configured RSS feeds
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.info(`[RSS] Fetching feed: ${feed.name} (${feed.url})`);
        
        // Construct the Netlify function URL
        const functionUrl = import.meta.env.PROD 
          ? '/.netlify/functions/fetch-rss' // Production URL
          : 'http://localhost:8888/.netlify/functions/fetch-rss'; // Local development URL
        
        const params = new URLSearchParams({ url: feed.url });
        const fullUrl = `${functionUrl}?${params}`;
        console.debug(`[RSS] Fetching from: ${fullUrl}`);

        const response = await fetch(fullUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[RSS] Failed to fetch feed ${feed.name}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText
          });
          return [];
        }
        
        const items = await response.json();
        console.info(`[RSS] Received ${items.length} items from ${feed.name}`);
        
        // Add feed name to metadata for each item
        return items.map((item: any) => ({
          ...item,
          metadata: {
            ...item.metadata,
            feedTitle: feed.name
          }
        }));
      } catch (feedError) {
        console.error(`[RSS] Error processing feed ${feed.name}:`, {
          error: feedError instanceof Error ? {
            name: feedError.name,
            message: feedError.message,
            stack: feedError.stack
          } : feedError
        });
        return [];
      }
    });

    // Wait for all feeds to be fetched
    const results = await Promise.allSettled(feedPromises);
    
    // Filter out failed requests and flatten the results
    const items = results
      .filter((result): result is PromiseFulfilledResult<ContentItem[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);

    console.info(`[RSS] Total items fetched: ${items.length}`);
    return items;
  } catch (error) {
    console.error('[RSS] General error fetching feeds:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
    return [];
  }
}
