import { useQuery } from '@tanstack/react-query';
import { fetchForumPosts } from '../lib/api/forum';

export function useForumPosts() {
  return useQuery({
    queryKey: ['forumPosts'],
    queryFn: fetchForumPosts,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}