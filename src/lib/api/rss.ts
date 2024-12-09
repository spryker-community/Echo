import { ContentItem } from '../../types';

// Dynamically get RSS feed configurations from environment variables
function getRSSFeeds() {
  const feeds = [];
  let index = 1;

  // Keep checking for feeds until we find one that doesn't exist
  while (true) {
    const name = import.meta.env[`VITE_RSS_FEED_${index}_NAME`];
    const url = import.meta.env[`VITE_RSS_FEED_${index}_URL`];

    // If either name or url is missing, we've reached the end
    if (!name || !url) {
      break;
    }

    feeds.push({
      name,
      url
    });

    index++;
  }

  return feeds;
}

const RSS_FEEDS = getRSSFeeds();

export async function fetchRSSFeeds(): Promise<ContentItem[]> {
  try {
    // Check if RSS feeds are configured
    if (RSS_FEEDS.length === 0) {
      console.info('[RSS] No RSS feeds configured');
      console.debug('[RSS] Environment variables state:', {
        envKeys: Object.keys(import.meta.env)
          .filter(key => key.startsWith('VITE_RSS_FEED_'))
          .reduce((acc, key) => ({
            ...acc,
            [key]: import.meta.env[key]
          }), {})
      });
      return [];
    }

    console.info('[RSS] Starting to fetch feeds:', RSS_FEEDS.map(f => ({ name: f.name, url: f.url })));

    // Fetch all configured RSS feeds
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.info(`[RSS] Fetching feed: ${feed.name} (${feed.url})`);
        
        // Construct the Netlify function URL with absolute path
        const functionUrl = import.meta.env.DEV 
          ? 'http://localhost:8888/.netlify/functions/fetch-rss'
          : `${window.location.origin}/.netlify/functions/fetch-rss`;
        
        const params = new URLSearchParams({ url: feed.url });
        const fullUrl = `${functionUrl}?${params}`;
        
        console.debug(`[RSS] Making request to: ${fullUrl}`);

        const response = await fetch(fullUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[RSS] Failed to fetch feed ${feed.name}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            responseHeaders: Object.fromEntries(response.headers.entries())
          });
          return [];
        }
        
        const items = await response.json();
        console.info(`[RSS] Successfully received ${items.length} items from ${feed.name}`);
        
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
          } : feedError,
          feed
        });
        return [];
      }
    });

    // Wait for all feeds to be fetched
    const results = await Promise.allSettled(feedPromises);
    
    // Log the results of each feed
    results.forEach((result, index) => {
      const feed = RSS_FEEDS[index];
      if (result.status === 'fulfilled') {
        console.info(`[RSS] Feed ${feed.name} completed successfully with ${result.value.length} items`);
      } else {
        console.error(`[RSS] Feed ${feed.name} failed:`, result.reason);
      }
    });

    // Filter out failed requests and flatten the results
    const items = results
      .filter((result): result is PromiseFulfilledResult<ContentItem[]> => 
        result.status === 'fulfilled'
      )
      .flatMap(result => result.value);

    console.info(`[RSS] Total RSS items fetched: ${items.length}`);
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
