import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Team } from '../types';

interface GeneratedMessageProps {
  content: string;
  targetAudiences: Team[];
  onCopy: () => void;
  onRegenerate: () => void;
}

export function GeneratedMessage({ 
  content, 
  targetAudiences, 
  onCopy, 
  onRegenerate 
}: GeneratedMessageProps) {
  return (
    <Card className="w-full mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Generated Message</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {targetAudiences.map(team => (
            <span 
              key={team}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {team}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <pre className="whitespace-pre-wrap font-sans text-sm">
          {content}
        </pre>
      </CardContent>
      <CardFooter className="gap-2 justify-end">
        <button
          onClick={onRegenerate}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
        >
          Regenerate
        </button>
        <button
          onClick={onCopy}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Copy to Clipboard
        </button>
      </CardFooter>
    </Card>
  );
}