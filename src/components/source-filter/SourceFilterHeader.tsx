import React from 'react';
import { Eye, RefreshCw } from 'lucide-react';

interface SourceFilterHeaderProps {
  hiddenCount: number;
  onUnhideAll: () => void;
  onRefresh: () => void;
}

export function SourceFilterHeader({ hiddenCount, onUnhideAll, onRefresh }: SourceFilterHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-[#00AEEF] font-replica">
        Content Sources
      </h2>
      <div className="flex items-center gap-2">
        {hiddenCount > 0 && (
          <button
            onClick={onUnhideAll}
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                     bg-gradient-to-br from-white via-white to-gray-50/30 
                     dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60
                     text-[#00AEEF] hover:text-[#EC008C] 
                     dark:text-[#00AEEF] dark:hover:text-[#EC008C] 
                     border border-[#00AEEF]/20 dark:border-[#00AEEF]/30 
                     hover:border-[#EC008C]/30 dark:hover:border-[#EC008C]/40
                     shadow-sm hover:shadow-md
                     transition-all duration-200
                     font-replica"
            aria-label={`Show ${hiddenCount} hidden posts`}
          >
            <Eye className="h-4 w-4" />
            <span className="ml-1.5 text-sm font-medium">Show Hidden ({hiddenCount})</span>
          </button>
        )}
        <button
          onClick={onRefresh}
          className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                   bg-gradient-to-br from-white via-white to-gray-50/30 
                   dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60
                   text-[#00AEEF] hover:text-[#EC008C] 
                   dark:text-[#00AEEF] dark:hover:text-[#EC008C] 
                   border border-[#00AEEF]/20 dark:border-[#00AEEF]/30 
                   hover:border-[#EC008C]/30 dark:hover:border-[#EC008C]/40
                   shadow-sm hover:shadow-md
                   transition-all duration-200
                   font-replica"
          aria-label="Refresh sources"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="ml-1.5 text-sm font-medium">Refresh Sources</span>
        </button>
      </div>
    </div>
  );
}
