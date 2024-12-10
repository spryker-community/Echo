import React from 'react';
import { SourceConfig } from '../../types';

interface SourceCardProps {
  source: SourceConfig;
  icon: string;
  label: string;
  status: string;
  statusColor: string;
  onToggle: (id: string) => void;
}

export function SourceCard({ 
  source, 
  icon, 
  label, 
  status, 
  statusColor, 
  onToggle 
}: SourceCardProps) {
  return (
    <button
      onClick={() => onToggle(source.id)}
      className={`h-20 flex flex-col items-center justify-center p-2 rounded-lg 
                 shadow-sm hover:shadow-md transition-all duration-300
                 ${source.enabled 
                   ? 'bg-gradient-to-br from-[#00AEEF]/5 via-[#00AEEF]/3 to-transparent dark:from-[#00AEEF]/15 dark:via-[#00AEEF]/10 dark:to-[#00AEEF]/5 border-[#00AEEF]' 
                   : 'bg-gradient-to-br from-white via-white to-gray-50/30 dark:from-[#011427]/80 dark:via-[#011427]/70 dark:to-[#011427]/60 hover:border-[#EC008C] dark:hover:border-[#EC008C] border-gray-200 dark:border-gray-700'} 
                 border-2 hover:scale-[1.02]
                 font-manrope`}
    >
      <img 
        src={icon} 
        alt={label}
        className="w-6 h-6 object-contain mb-1"
      />
      <span className={`text-xs font-medium leading-none text-center mb-1 font-replica
                     ${source.enabled 
                       ? 'text-[#00AEEF] dark:text-[#00AEEF]' 
                       : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
      <span className={`text-[10px] leading-none ${statusColor}`}>
        {status}
      </span>
    </button>
  );
}
