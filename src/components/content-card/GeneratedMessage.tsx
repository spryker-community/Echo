import React from 'react';
import { Copy, Check, Edit2, Save, XCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface GeneratedMessageProps {
  content: string;
  targetAudiences: string[];
  onUpdate: (newContent: string) => void;
}

export function GeneratedMessage({ content, targetAudiences, onUpdate }: GeneratedMessageProps) {
  const { showToast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(content);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setHasCopied(true);
    showToast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdate(editedContent.trim());
      setIsEditing(false);
      showToast({
        title: "Saved",
        description: "Message updated successfully",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <h4 className="text-sm font-medium text-gray-900 dark:text-[#00AEEF]">Generated Message</h4>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 pb-1">
        Target audience: {targetAudiences.join(', ')}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[100px] p-2 text-sm text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-[#011427] border border-gray-200 dark:border-gray-600 
                     rounded-md focus:outline-none focus:ring-2 focus:ring-[#00AEEF] 
                     focus:border-transparent resize-y"
            placeholder="Edit your message..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm font-medium text-gray-600 dark:text-gray-400
                       rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-colors flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm font-medium text-white
                       bg-[#00AEEF] hover:bg-[#EC008C] rounded-md
                       transition-colors flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pb-12">
            {content}
          </p>
          <div className="absolute bottom-0 right-0 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-400 hover:text-[#00AEEF] dark:text-gray-500 dark:hover:text-[#00AEEF] 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                       flex items-center gap-1"
              title="Copy message"
            >
              {hasCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="text-sm">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-[#00AEEF] dark:text-gray-500 dark:hover:text-[#00AEEF] 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                       flex items-center gap-1"
              title="Edit message"
            >
              <Edit2 className="w-5 h-5" />
              <span className="text-sm">Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
