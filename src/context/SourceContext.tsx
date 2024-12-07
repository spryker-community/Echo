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
    return saved ? JSON.parse(saved) : defaultSources;
  });

  useEffect(() => {
    localStorage.setItem('sources', JSON.stringify(sources));
  }, [sources]);

  const toggleSource = (id: string) => {
    setSources(prev =>
      prev.map(source =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
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