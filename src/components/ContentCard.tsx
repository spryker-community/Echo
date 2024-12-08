import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ContentItem } from '../types';
import { formatDate, formatRelativeTime } from '../lib/utils';

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

  const shouldShowImage = item.source === 'youtube' && item.image;

  const renderMetadata = () => {
    switch (item.source) {
      case 'vanilla-forum': {
        const { insertUser, categoryName, countComments, dateLastComment } = item.metadata;
        const hasNewActivity = dateLastComment && new Date(dateLastComment) > new Date(item.date);
        
        return (
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
              {insertUser && (
                <div className="flex items-center gap-1 min-w-0">
                  {insertUser.photoUrl ? (
                    <img 
                      src={insertUser.photoUrl} 
                      alt={insertUser.name}
                      className="w-4 h-4 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <span className="flex-shrink-0">👤</span>
                  )}
                  <a 
                    href={insertUser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {insertUser.name}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <a 
                  href={item.metadata.categoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {categoryName}
                </a>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span>{countComments} comments</span>
              </div>
            </div>
            {hasNewActivity && (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="text-xs text-blue-500 font-medium">
                  Updated {formatRelativeTime(dateLastComment)}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'youtube':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{item.metadata.channelTitle}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-start gap-4">
          {shouldShowImage && (
            <img 
              src={item.image} 
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
            />
          )}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <img 
                src={sourceIcons[item.source]} 
                alt={item.source}
                className="w-5 h-5 object-contain flex-shrink-0"
              />
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {item.title}
                </a>
              </CardTitle>
            </div>
            <div className="space-y-1.5">
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(item.date)}
              </CardDescription>
              {renderMetadata()}
            </div>
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
          onClick={() => onGenerate(item)}
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
          aria-label={isGenerating ? 'Generating post' : 'Generate post'}
        >
          {isGenerating 
            ? 'Generating...' 
            : generatedContent 
              ? 'Regenerate AI Post' 
              : 'Generate AI Post'}
        </button>
      </CardFooter>
    </Card>
  );
}
