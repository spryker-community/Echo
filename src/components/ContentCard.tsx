import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ContentItem } from '../types';
import { formatDate, formatRelativeTime } from '../lib/utils';
import { useHidden } from '../context/HiddenContext';
import { X, Copy, Check } from 'lucide-react';
import { useToast } from '../hooks/useToast';

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
  const { hidePost } = useHidden();
  const { showToast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);
  
  const sourceIcons: Record<string, string> = {
    'vanilla-forum': '/images/commercequest.png',
    'youtube': '/images/youtube.svg',
    'youtube-search': '/images/youtube.svg',
    'bluesky': '/images/bluesky.svg',
    'rss': '/images/rss.svg'
  };

  const handleHide = () => {
    hidePost(item.id);
    showToast({
      title: "Post Hidden",
      description: "You can restore hidden posts using the 'Show Hidden' button.",
    });
  };

  const handleCopy = async () => {
    if (generatedContent?.content) {
      await navigator.clipboard.writeText(generatedContent.content);
      setHasCopied(true);
      showToast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'solved':
        return 'bg-[#00AEEF]/10 text-[#00AEEF] dark:bg-[#00AEEF]/20 dark:text-[#00AEEF]';
      case 'in_progress':
        return 'bg-[#EC008C]/10 text-[#EC008C] dark:bg-[#EC008C]/20 dark:text-[#EC008C]';
      default:
        return 'bg-[#00AEEF]/10 text-[#00AEEF] dark:bg-[#00AEEF]/20 dark:text-[#00AEEF]';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'solved':
        return 'Solved';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Open';
    }
  };

  const renderMetadata = () => {
    switch (item.source) {
      case 'vanilla-forum': {
        const { insertUser, categoryName, countComments, dateLastComment, status, type } = item.metadata;
        const hasNewActivity = dateLastComment && new Date(dateLastComment) > new Date(item.date);
        
        return (
          <div className="flex flex-col space-y-2">
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
                    className="hover:underline truncate hover:text-[#00AEEF] dark:hover:text-[#00AEEF]"
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
                  className="hover:underline hover:text-[#00AEEF] dark:hover:text-[#00AEEF]"
                >
                  {categoryName}
                </a>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span>{countComments} comments</span>
              </div>
              {type === 'question' && (
                <>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </>
              )}
            </div>
            {hasNewActivity && (
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#00AEEF]"></span>
                <span className="text-xs text-[#00AEEF] font-medium">
                  Updated {formatRelativeTime(dateLastComment)}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'youtube':
      case 'youtube-search':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{item.metadata.channelTitle}</span>
          </div>
        );

      case 'bluesky':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              {item.metadata.author.avatar ? (
                <img 
                  src={item.metadata.author.avatar} 
                  alt={item.metadata.author.name}
                  className="w-4 h-4 rounded-full flex-shrink-0"
                />
              ) : (
                <span className="flex-shrink-0">👤</span>
              )}
              <a 
                href={`https://bsky.app/profile/${item.metadata.author.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {item.metadata.author.name}
              </a>
            </div>
            {item.metadata.hasImages && (
              <>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span>{item.metadata.imageCount} image{item.metadata.imageCount !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        );

      case 'rss':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium">{item.metadata.feedTitle || 'RSS Feed'}</span>
            {item.metadata.categories && item.metadata.categories.length > 0 && (
              <>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                <span>{item.metadata.categories.join(', ')}</span>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isYouTubeContent = item.source === 'youtube' || item.source === 'youtube-search';

  return (
    <Card className="w-full bg-white dark:bg-[#011427] shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <CardHeader className="p-6 pb-0">
        <div className="flex items-start gap-4">
          {isYouTubeContent && item.image && (
            <img 
              src={item.image} 
              alt={item.title}
              className="w-20 h-20 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform flex-shrink-0"
            />
          )}
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src={sourceIcons[item.source]} 
                  alt={item.source}
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#00AEEF] transition-colors truncate">
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
              <button
                onClick={handleHide}
                className="p-1.5 text-gray-400 hover:text-[#EC008C] dark:text-gray-500 dark:hover:text-[#EC008C] 
                         rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                         opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Hide post"
              >
                <X className="w-4 h-4" />
              </button>
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
        <div className="mx-6 mb-6 p-4 bg-gray-50 dark:bg-[#011427]/50 rounded-lg border border-gray-100 dark:border-gray-700">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#00AEEF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Generating insight...
              </p>
            </div>
          ) : generatedContent && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-[#00AEEF]">Generated Message</h4>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-gray-400 hover:text-[#00AEEF] dark:text-gray-500 dark:hover:text-[#00AEEF] 
                             rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy message"
                  >
                    {hasCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
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
                     focus:outline-none focus:ring-2 focus:ring-[#00AEEF]
                     ${isGenerating 
                       ? 'bg-[#00AEEF]/60 cursor-not-allowed' 
                       : 'bg-[#00AEEF] hover:bg-[#EC008C]'}`}
          data-testid="generate-insight-button"
          type="button"
          role="button"
          aria-label={isGenerating ? 'Generating message' : 'Generate message'}
        >
          {isGenerating 
            ? 'Generating...' 
            : generatedContent 
              ? 'Regenerate Message' 
              : 'Generate Message'}
        </button>
      </CardFooter>
    </Card>
  );
}
