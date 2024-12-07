import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ContentItem } from '../types';
import { formatDate } from '../lib/utils';

interface ContentCardProps {
  item: ContentItem;
  onGenerate: (item: ContentItem) => void;
  generatedContent?: {
    content: string;
    targetAudiences: string[];
  };
  isGenerating?: boolean;
}

export function ContentCard({ item, onGenerate, generatedContent, isGenerating }: ContentCardProps) {
  const sourceIcons: Record<string, string> = {
    'vanilla-forum': '/images/commercequest.png',
    'youtube': '/images/youtube.svg'
  };

  // Safely check if countComments exists and is a number
  const commentCount = item.metadata && 'countComments' in item.metadata 
    ? item.metadata.countComments 
    : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isGenerating) {
      console.log('Generate button clicked for item:', {
        id: item.id,
        title: item.title,
        source: item.source
      });
      onGenerate(item);
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
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
            <div className="flex items-center space-x-2 mb-1">
              <img 
                src={sourceIcons[item.source]} 
                alt={item.source}
                className="w-5 h-5 object-contain"
              />
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {item.title}
              </CardTitle>
            </div>
            <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(item.date)}
              {commentCount !== null && commentCount !== undefined && (
                <span className="ml-2">• {String(commentCount)} comments</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {item.description}
        </p>
      </CardContent>
      
      {(generatedContent || isGenerating) && (
        <div className="mx-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Generating insight...
              </p>
            </div>
          ) : generatedContent && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Generated Insight</h4>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  For: {generatedContent.targetAudiences.join(', ')}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {generatedContent.content}
              </p>
            </>
          )}
        </div>
      )}

      <CardFooter className="p-6 pt-0 flex justify-end">
        <button
          onClick={handleClick}
          disabled={isGenerating}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg 
                     transition-colors duration-300 ease-in-out cursor-pointer
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     ${isGenerating 
                       ? 'bg-blue-400 cursor-not-allowed' 
                       : 'bg-blue-600 hover:bg-blue-700'}`}
          data-testid="generate-insight-button"
          type="button"
          role="button"
          aria-label={isGenerating ? 'Generating insight' : 'Generate insight'}
        >
          {isGenerating 
            ? 'Generating...' 
            : generatedContent 
              ? 'Regenerate Insight' 
              : 'Generate Insight'}
        </button>
      </CardFooter>
    </Card>
  );
}
