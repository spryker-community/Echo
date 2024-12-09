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
  const isForumContent = item.source === 'vanilla-forum';

  return (
    <Card className="w-full bg-white dark:bg-[#011427] shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl border-0">
      <CardHeader className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {isYouTubeContent && item.image && (
            <img 
              src={item.image} 
              alt={item.title}
              className="w-24 h-24 object-cover rounded-lg shadow-md transition-transform flex-shrink-0
                       hover:scale-105 hover:shadow-xl"
            />
          )}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-grow">
                <img 
                  src={sourceIcons[item.source]} 
                  alt={item.source}
                  className="w-6 h-6 object-contain flex-shrink-0 mt-1"
                />
                <div className="min-w-0 flex-grow">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white hover:text-[#00AEEF] 
                                    transition-colors duration-200 truncate leading-tight mb-2">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                  </CardTitle>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{formatDate(item.date)}</span>
                    <span>•</span>
                    <SourceMetadata source={item.source} metadata={item.metadata} />
                  </div>
                </div>
              </div>
              <button
                onClick={handleHide}
                className="p-2 text-gray-400 hover:text-[#EC008C] dark:text-gray-500 dark:hover:text-[#EC008C] 
                         rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200
                         opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0 mt-1"
                title="Hide post"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-3">
        {isForumContent ? (
          <div 
            className="prose prose-sm dark:prose-invert max-w-none
                     prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                     prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                     prose-a:text-[#00AEEF] prose-a:no-underline hover:prose-a:text-[#EC008C] hover:prose-a:underline
                     prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                     prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg
                     prose-img:rounded-lg prose-img:shadow-md hover:prose-img:shadow-lg prose-img:transition-shadow
                     prose-blockquote:border-l-4 prose-blockquote:border-gray-200 dark:prose-blockquote:border-gray-700
                     prose-blockquote:pl-4 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                     prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5
                     prose-li:text-gray-700 dark:prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        ) : (
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {item.description}
          </p>
        )}
      </CardContent>
      
      {(generatedContent || isGenerating) && (
        <div className="mx-6 mb-6 mt-2">
          <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-[#011427]/80 dark:to-[#011427]/50 
                       rounded-xl border border-gray-100/50 dark:border-gray-700/50 backdrop-blur-sm
                       shadow-sm hover:shadow-md transition-all duration-200">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-3">
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
        </div>
      )}

      <CardFooter className="px-6 pb-6 pt-0 flex justify-end">
        <button
          onClick={() => onGenerate(item)}
          disabled={isGenerating}
          className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg 
                     transition-all duration-300 ease-in-out
                     focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2
                     dark:focus:ring-offset-[#011427]
                     ${isGenerating 
                       ? 'bg-[#00AEEF]/60 cursor-not-allowed' 
                       : 'bg-[#00AEEF] hover:bg-[#EC008C] hover:shadow-lg'}`}
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
