import { useMemo } from 'react';
import { useForumPosts } from './useForumPosts';
import { useYouTubeVideos } from './useYouTubeVideos';
import { useSources } from '../context/SourceContext';
import { ContentItem } from '../types';
import { mockItems } from '../lib/mockData';

export function useContentItems() {
  const { data: forumPosts = [] } = useForumPosts();
  const { data: youtubeVideos = [], error: youtubeError } = useYouTubeVideos();
  const { sources } = useSources();

  // Log YouTube data and errors for debugging
  console.log('YouTube Videos:', youtubeVideos);
  console.log('Forum Posts:', forumPosts);
  if (youtubeError) {
    console.error('YouTube Error:', youtubeError);
  }

  const enabledSources = sources
    .filter(source => source.enabled)
    .map(source => source.id);

  const items = useMemo(() => {
    // Use actual forum posts in both development and production
    const allItems: ContentItem[] = [
      ...forumPosts,
      ...youtubeVideos
    ];
    
    return allItems
      .filter(item => enabledSources.includes(item.source))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [forumPosts, youtubeVideos, enabledSources]);

  return items;
}
