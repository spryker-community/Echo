import { useQuery } from '@tanstack/react-query';
import { fetchRSSFeeds } from '../lib/api/rss';
import { ContentItem, RSSSourceConfig } from '../types';
import { useSources } from '../context/SourceContext';

export function useRSSFeeds(enabled: boolean = false) {
  const { sources } = useSources();
  
  // Get enabled RSS feeds
  const enabledRSSFeeds = sources.filter(
    (source): source is RSSSourceConfig => source.type === 'rss' && source.enabled
  );

  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<ContentItem[], Error>({
    queryKey: ['rss-feeds'],
    queryFn: fetchRSSFeeds,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchOnWindowFocus: true,
    enabled: enabled && enabledRSSFeeds.length > 0, // Only fetch if enabled and at least one RSS feed is enabled
  });

  // Filter items to only include enabled feeds
  const filteredItems = items.filter(item => {
    if (item.source !== 'rss') return false;
    return enabledRSSFeeds.some(feed => feed.name === item.metadata.feedTitle);
  });

  return {
    items: filteredItems,
    isLoading,
    isError,
    error,
    refetch,
  };
}
