import React, { createContext, useContext, useState, useEffect } from 'react';
import { SourceConfig } from '../types';
import { defaultSources } from '../config/sources';

interface SourceContextType {
  sources: SourceConfig[];
  toggleSource: (id: string) => void;
}

const SourceContext = createContext<SourceContextType | undefined>(undefined);

export function SourceProvider({ children }: { children: React.ReactNode }) {
  const [sources, setSources] = useState<SourceConfig[]>(() => {
    const saved = localStorage.getItem('sources');
    let initialSources = saved ? JSON.parse(saved) : defaultSources;

    // Ensure Gartner source exists and is enabled
    const gartnerSource = initialSources.find((s: SourceConfig) => s.id === 'gartner');
    if (!gartnerSource) {
      // If Gartner source doesn't exist, add it
      initialSources = [
        ...initialSources,
        {
          id: 'gartner',
          type: 'review' as const,
          url: '/data/gartner-reviews.json',
          enabled: true
        }
      ];
    } else if (!gartnerSource.enabled) {
      // If Gartner source exists but is disabled, enable it
      initialSources = initialSources.map((source: SourceConfig) =>
        source.id === 'gartner' ? { ...source, enabled: true } : source
      );
    }

    return initialSources;
  });

  useEffect(() => {
    localStorage.setItem('sources', JSON.stringify(sources));
  }, [sources]);

  const toggleSource = (id: string) => {
    setSources(prev =>
      prev.map(source =>
        source.id === id
          // Don't allow disabling Gartner source
          ? { ...source, enabled: source.id === 'gartner' ? true : !source.enabled }
          : source
      )
    );
  };

  return (
    <SourceContext.Provider value={{ sources, toggleSource }}>
      {children}
    </SourceContext.Provider>
  );
}

export function useSources() {
  const context = useContext(SourceContext);
  if (context === undefined) {
    throw new Error('useSources must be used within a SourceProvider');
  }
  return context;
}
