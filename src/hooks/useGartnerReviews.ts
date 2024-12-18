import { useEffect, useState } from 'react';
import { ContentItem, GartnerMetadata } from '../types';

interface GartnerReview {
  id: string;
  title: string;
  content: string;
  rating: string;
  date: string;
  reviewer: {
    role?: string;
    industry?: string;
    company?: string;
    size?: string;
  };
  url: string;
}

interface GartnerReviewsData {
  lastUpdated: string;
  reviews: GartnerReview[];
}

export function useGartnerReviews() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/data/gartner-reviews.json');
        if (!response.ok) {
          throw new Error('Failed to fetch Gartner reviews');
        }

        const data: GartnerReviewsData = await response.json();
        
        const contentItems: ContentItem[] = data.reviews.map(review => ({
          id: review.id,
          title: review.title || 'Gartner Review',
          description: review.content,
          url: review.url,
          date: review.date,
          source: 'gartner',
          type: 'review',
          metadata: {
            rating: review.rating,
            reviewer: {
              role: review.reviewer.role,
              industry: review.reviewer.industry,
              company: review.reviewer.company,
              size: review.reviewer.size
            }
          } as GartnerMetadata
        }));
        
        setItems(contentItems);
      } catch (err) {
        console.error('Error fetching Gartner reviews:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch Gartner reviews'));
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return { items, loading, error };
}
