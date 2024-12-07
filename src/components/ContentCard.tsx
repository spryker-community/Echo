import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ContentItem } from '../types';
import { formatDate } from '../lib/utils';

interface ContentCardProps {
  item: ContentItem;
  onGenerate: (item: ContentItem) => void;
}

export function ContentCard({ item, onGenerate }: ContentCardProps) {
  const sourceIcons: Record<string, string> = {
    'vanilla-forum': '💬',
    'youtube': '📺'
  };

  // Safely check if countComments exists and is a number
  const commentCount = item.metadata && 'countComments' in item.metadata 
    ? item.metadata.countComments 
    : null;

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-start space-x-4">
          {item.image && (
            <img 
              src={item.image} 
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
            />
          )}
          <div className="flex-grow">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
              {item.title}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <span className="mr-2">{sourceIcons[item.source] || '🌐'}</span>
              {formatDate(item.date)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {item.description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {item.source === 'vanilla-forum' ? 'Community Forum' : 'YouTube'}
          </span>
          {commentCount !== null && commentCount !== undefined && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              • {String(commentCount)} comments
            </span>
          )}
        </div>
        <button
          onClick={() => onGenerate(item)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     transition-colors duration-300 ease-in-out"
        >
          Generate Insight
        </button>
      </CardFooter>
    </Card>
  );
}
