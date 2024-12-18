import { useEffect, useState } from 'react';
import { ContentItem, GartnerMetadata } from '../types';

interface GartnerReview {
  totalScore: string;
  title: string;
  shortDescription: string;
  fullReviewLink: string | null;
  date: string;
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
          id: review.title, // Using title as ID since we don't have a specific ID field
          title: review.title,
          description: review.shortDescription,
          url: review.fullReviewLink || '',
          date: review.date, // Using the review's date instead of lastUpdated
          source: 'gartner',
          type: 'review',
          metadata: {
            rating: review.totalScore,
            reviewer: {
              role: '',
              industry: '',
              company: '',
              size: ''
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
