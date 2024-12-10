import React from 'react';
import { SourceConfig, RSSSourceConfig } from '../../types';
import { SourceCard } from './SourceCard';

interface SourceGridProps {
  sources: SourceConfig[];
  getIcon: (sourceId: string) => string;
  getLabel: (source: SourceConfig) => string;
  getStatus: (sourceId: string) => string;
  getStatusColor: (sourceId: string) => string;
  onToggle: (id: string) => void;
  isRSSGrid?: boolean;
}

export function SourceGrid({
  sources,
  getIcon,
  getLabel,
  getStatus,
  getStatusColor,
  onToggle,
  isRSSGrid = false,
}: SourceGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 
                    ${isRSSGrid ? 'mt-3' : ''}`}>
      {sources.map((source) => (
        <SourceCard
          key={source.id}
          source={source}
          icon={getIcon(source.id)}
          label={getLabel(source)}
          status={getStatus(source.id)}
          statusColor={getStatusColor(source.id)}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
