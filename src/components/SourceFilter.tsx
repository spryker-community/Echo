import React from 'react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useSources } from '../context/SourceContext';

export function SourceFilter() {
  const { sources, toggleSource } = useSources();

  const sourceDetails = {
    'vanilla-forum': {
      name: 'Community Forum',
      icon: <img src="/images/commercequest.png" alt="Community Forum" className="w-6 h-6 object-contain" />
    },
    'youtube': {
      name: 'YouTube',
      icon: '📺'
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3">🌐</span>
          Content Sources
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sources.filter(s => s.enabled).length} / {sources.length} Active
        </span>
      </div>
      <div className="space-y-4">
        {sources.map(source => (
          <div 
            key={source.id} 
            className={`
              flex items-center justify-between p-3 rounded-lg transition-all duration-300
              ${source.enabled 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' 
                : 'bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-600'}
            `}
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl flex items-center justify-center w-8 h-8">
                {sourceDetails[source.id as keyof typeof sourceDetails].icon}
              </span>
              <Label 
                htmlFor={source.id} 
                className={`
                  text-sm font-medium 
                  ${source.enabled 
                    ? 'text-blue-800 dark:text-blue-200' 
                    : 'text-gray-600 dark:text-gray-300'}
                `}
              >
                {sourceDetails[source.id as keyof typeof sourceDetails].name}
              </Label>
            </div>
            <Switch
              id={source.id}
              checked={source.enabled}
              onCheckedChange={() => toggleSource(source.id)}
              className={`
                ${source.enabled 
                  ? 'border-blue-300 dark:border-blue-700' 
                  : 'border-gray-300 dark:border-gray-600'}
              `}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
