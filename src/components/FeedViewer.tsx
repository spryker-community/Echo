import React from 'react';
import { ContentCard } from './ContentCard';
import { SourceFilter } from './SourceFilter';
import { useContentItems } from '../hooks/useContentItems';
import { ContentItem } from '../types';

interface FeedViewerProps {
  onGenerate: (item: ContentItem) => void;
}

export function FeedViewer({ onGenerate }: FeedViewerProps) {
  const items = useContentItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SourceFilter />
      </div>
      
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="transition-all duration-300 ease-in-out transform hover:-translate-y-2"
            >
              <ContentCard
                item={item}
                onGenerate={onGenerate}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-4">
            No Content Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Select sources or check your connection to view content.
          </p>
        </div>
      )}
    </div>
  );
}
