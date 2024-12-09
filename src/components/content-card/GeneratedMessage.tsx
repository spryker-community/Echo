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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-semibold bg-gradient-to-r from-[#00AEEF] to-[#EC008C] 
                       text-transparent bg-clip-text">
            Generated Message
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>for</span>
            <div className="flex flex-wrap gap-1">
              {targetAudiences.map((audience, index) => (
                <span key={audience} className="inline-flex items-center px-2 py-0.5 rounded-full 
                                           bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                  {audience}
                  {index < targetAudiences.length - 1 && ","}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[120px] p-3 text-base text-gray-700 dark:text-gray-300 
                     bg-white dark:bg-[#011427] border border-gray-200 dark:border-gray-600 
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00AEEF] 
                     focus:border-transparent resize-y leading-relaxed"
            placeholder="Edit your message..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400
                       rounded-lg border border-gray-200 dark:border-gray-600
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-200 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white
                       bg-[#00AEEF] hover:bg-[#EC008C] rounded-lg
                       transition-all duration-200 flex items-center gap-2
                       hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pb-14">
            {content}
          </p>
          <div className="absolute bottom-0 right-0 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-[#00AEEF] dark:hover:text-[#00AEEF] 
                       rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 
                       transition-all duration-200 flex items-center gap-2
                       border border-gray-200 dark:border-gray-600"
              title="Copy message"
            >
              {hasCopied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span className="text-sm font-medium">Copy</span>
                </>
              )}
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-white bg-[#00AEEF] hover:bg-[#EC008C]
                       rounded-lg transition-all duration-200 flex items-center gap-2
                       hover:shadow-lg"
              title="Edit message"
            >
              <Edit2 className="w-5 h-5" />
              <span className="text-sm font-medium">Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
