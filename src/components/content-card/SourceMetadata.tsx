import React from 'react';
import { formatRelativeTime } from '../../lib/utils';

interface SourceMetadataProps {
  source: string;
  metadata: Record<string, any>;
}

function getStatusColor(status: string | undefined) {
  switch (status) {
    case 'solved':
      return 'bg-[#00AEEF]/10 text-[#00AEEF] dark:bg-[#00AEEF]/20 dark:text-[#00AEEF]';
    case 'in_progress':
      return 'bg-[#EC008C]/10 text-[#EC008C] dark:bg-[#EC008C]/20 dark:text-[#EC008C]';
    default:
      return 'bg-[#00AEEF]/10 text-[#00AEEF] dark:bg-[#00AEEF]/20 dark:text-[#00AEEF]';
  }
}

function getStatusLabel(status: string | undefined) {
  switch (status) {
    case 'solved':
      return 'Solved';
    case 'in_progress':
      return 'In Progress';
    default:
      return 'Open';
  }
}

export function SourceMetadata({ source, metadata }: SourceMetadataProps) {
  switch (source) {
    case 'gartner': {
      const { rating, reviewer } = metadata;
      const details = [
        reviewer.role,
        reviewer.industry,
        reviewer.company,
        reviewer.size
      ].filter(Boolean);

      return (
        <div className="flex flex-col space-y-2 font-manrope">
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-medium">Rating: {rating}</span>
              {details.length > 0 && (
                <>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                  <span>{details.join(' • ')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    case 'vanilla-forum': {
      const { insertUser, categoryName, countComments, dateLastComment, status, type } = metadata;
      const hasNewActivity = dateLastComment && new Date(dateLastComment) > new Date(metadata.date);
      
      return (
        <div className="flex flex-col space-y-2 font-manrope">
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
                href={metadata.categoryUrl}
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
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-manrope">
          <span className="font-medium">{metadata.channelTitle}</span>
        </div>
      );

    case 'bluesky':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-manrope">
          <div className="flex items-center gap-1">
            {metadata.author.avatar ? (
              <img 
                src={metadata.author.avatar} 
                alt={metadata.author.name}
                className="w-4 h-4 rounded-full flex-shrink-0"
              />
            ) : (
              <span className="flex-shrink-0">👤</span>
            )}
            <a 
              href={`https://bsky.app/profile/${metadata.author.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {metadata.author.name}
            </a>
          </div>
          {metadata.hasImages && (
            <>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
              <span>{metadata.imageCount} image{metadata.imageCount !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      );

    case 'rss':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-manrope">
          <span className="font-medium">{metadata.feedTitle || 'RSS Feed'}</span>
          {metadata.categories && metadata.categories.length > 0 && (
            <>
              <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
              <span>{metadata.categories.join(', ')}</span>
            </>
          )}
        </div>
      );

    default:
      return null;
  }
}
