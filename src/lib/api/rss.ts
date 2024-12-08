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
      console.info('No RSS feeds configured');
      return [];
    }

    console.info('Fetching RSS feeds:', RSS_FEEDS.map(f => f.name));

    // Fetch all configured RSS feeds
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        console.info(`Fetching RSS feed: ${feed.name}`);
        const params = new URLSearchParams({ url: feed.url });
        const response = await fetch(`/.netlify/functions/fetch-rss?${params}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Failed to fetch RSS feed ${feed.name}:`, errorText);
          return [];
        }
        
        const items = await response.json();
        console.info(`Received ${items.length} items from ${feed.name}`);
        
        // Add feed name to metadata for each item
        return items.map((item: any) => ({
          ...item,
          metadata: {
            ...item.metadata,
            feedTitle: feed.name
          }
        }));
      } catch (feedError) {
        console.warn(`Error processing RSS feed ${feed.name}:`, feedError);
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

    console.info(`Total RSS items fetched: ${items.length}`);
    return items;
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return [];
  }
}
