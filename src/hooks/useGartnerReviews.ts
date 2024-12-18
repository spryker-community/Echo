import { useEffect, useState } from 'react';
import { ContentItem, GartnerMetadata } from '../types';

interface GartnerReview {
  rating: number;
  title: string;
  text: string;
  date: string;
  reviewerFunction: string;
  companySize: string;
  industry: string;
}

interface GartnerReviewsData {
  lastUpdated: string;
  reviewsUrl: string;
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
          id: `gartner-${review.title}`, // Using title as part of ID
          title: review.title,
          description: review.text,
          url: data.reviewsUrl, // Using the overview page URL for all reviews
          date: review.date,
          source: 'gartner',
          type: 'review',
          metadata: {
            rating: review.rating.toString(),
            reviewer: {
              role: review.reviewerFunction,
              industry: review.industry,
              company: '',
              size: review.companySize
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
