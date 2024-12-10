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
      <h2 className="text-lg font-semibold text-gray-900 dark:text-[#00AEEF]">
        Content Sources
      </h2>
      <div className="flex items-center gap-3">
        {hiddenCount > 0 && (
          <button
            onClick={onUnhideAll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                     bg-gradient-to-br from-white via-white to-gray-50/30 
                     dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60
                     text-[#00AEEF] hover:text-[#EC008C] 
                     dark:text-[#00AEEF] dark:hover:text-[#EC008C] 
                     border border-[#00AEEF] dark:border-[#00AEEF] rounded-lg 
                     hover:border-[#EC008C] dark:hover:border-[#EC008C]
                     shadow-sm hover:shadow-md
                     transition-all duration-200"
            aria-label={`Show ${hiddenCount} hidden posts`}
          >
            <Eye className="w-4 h-4" />
            <span>Show Hidden ({hiddenCount})</span>
          </button>
        )}
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                   bg-gradient-to-br from-white via-white to-gray-50/30 
                   dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60
                   text-[#00AEEF] hover:text-[#EC008C] 
                   dark:text-[#00AEEF] dark:hover:text-[#EC008C] 
                   border border-[#00AEEF] dark:border-[#00AEEF] rounded-lg 
                   hover:border-[#EC008C] dark:hover:border-[#EC008C]
                   shadow-sm hover:shadow-md
                   transition-all duration-200"
          aria-label="Refresh sources"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Sources</span>
        </button>
      </div>
    </div>
  );
}
