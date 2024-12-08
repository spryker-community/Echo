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
      className={`h-20 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
                 hover:scale-[1.02] hover:shadow-md
                 ${source.enabled 
                   ? 'border-[#00AEEF] bg-[#00AEEF]/5 dark:bg-[#00AEEF]/10' 
                   : 'border-gray-200 dark:border-gray-700 hover:border-[#EC008C] dark:hover:border-[#EC008C] bg-gray-50/50 dark:bg-[#011427]/50'}`}
    >
      <img 
        src={icon} 
        alt={label}
        className="w-6 h-6 object-contain mb-1"
      />
      <span className={`text-xs font-medium leading-none text-center mb-1 ${source.enabled ? 'text-[#00AEEF] dark:text-[#00AEEF]' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
      <span className={`text-[10px] leading-none ${statusColor}`}>
        {status}
      </span>
    </button>
  );
}
