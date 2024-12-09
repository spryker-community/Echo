import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { ContentItem } from '../types';
import { formatDate } from '../lib/utils';
import { useHidden } from '../context/HiddenContext';
import { X } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { SourceMetadata } from './content-card/SourceMetadata';
import { GeneratedMessage } from './content-card/GeneratedMessage';
import { sourceIcons } from './content-card/source-icons';

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

  const handleHide = () => {
    hidePost(item.id);
    showToast({
      title: "Post Hidden",
      description: "You can restore hidden posts using the 'Show Hidden' button.",
    });
  };

  const handleUpdateMessage = (newContent: string) => {
    if (generatedContent) {
      generatedContent.content = newContent;
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
              <SourceMetadata source={item.source} metadata={item.metadata} />
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
            <GeneratedMessage 
              content={generatedContent.content}
              targetAudiences={generatedContent.targetAudiences}
              onUpdate={handleUpdateMessage}
            />
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
