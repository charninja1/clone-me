import { useState, useEffect } from 'react';
import { Card, Button, Input, TextArea, Badge } from '../components';

export default function GeneratedEmailDisplay({
  response,
  generatedSubject,
  editMode,
  editedResponse,
  editedSubject,
  onEditModeToggle,
  onSubjectChange,
  onResponseChange,
  onQuickRevision,
  onSaveRevision,
  onCancelEdit,
  onCopy,
  onOpenGmail,
  autoSave,
  isGenerating
}) {
  const [showContent, setShowContent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (response) {
      setTimeout(() => setShowContent(true), 100);
    }
  }, [response]);

  const handleCopy = () => {
    onCopy(response);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (!response) return null;

  return (
    <div className={`mt-8 border-t border-surface-200 dark:border-surface-700 pt-6 transition-all duration-500 ${
      showContent ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-surface-900 dark:text-surface-200">
          Generated Email
        </h3>
        {!editMode && (
          <Button
            onClick={onEditModeToggle}
            variant="outline"
            size="sm"
            icon={<span>✏️</span>}
            className="animate-fadeIn"
          >
            Edit
          </Button>
        )}
      </div>
      
      {autoSave && !editMode && (
        <div className="mb-4 animate-slideIn">
          <div className="p-3 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-md text-sm text-success-700 dark:text-success-400 flex items-center">
            <span className="animate-scaleIn mr-2">✓</span>
            This email has been automatically saved to your collection
          </div>
        </div>
      )}
      
      {editMode ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Editable subject line */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Subject Line
            </label>
            <Input
              value={editedSubject}
              onChange={(e) => onSubjectChange(e.target.value)}
              placeholder="Enter email subject"
              className="w-full"
            />
          </div>
          
          <TextArea
            rows={10}
            value={editedResponse}
            onChange={(e) => onResponseChange(e.target.value)}
            className="font-mono"
          />
          
          {/* Quick feedback buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Quick adjustments:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onQuickRevision('too formal')}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="hover:scale-105 transition-transform"
              >
                Too formal 🎩
              </Button>
              <Button
                onClick={() => onQuickRevision('too casual')}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="hover:scale-105 transition-transform"
              >
                Too casual 😎
              </Button>
              <Button
                onClick={() => onQuickRevision('make shorter')}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="hover:scale-105 transition-transform"
              >
                Make shorter ✂️
              </Button>
              <Button
                onClick={() => onQuickRevision('add details')}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="hover:scale-105 transition-transform"
              >
                Add details 📝
              </Button>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onSaveRevision}
              variant="primary"
              isLoading={isGenerating}
              className="shadow-lg"
            >
              Save Changes
            </Button>
            <Button 
              onClick={onCancelEdit}
              variant="outline"
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Subject line display */}
          {generatedSubject && (
            <div className="mb-4 animate-slideIn">
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                Subject Line
              </label>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-md border border-surface-200 dark:border-surface-700">
                <p className="text-surface-900 dark:text-surface-100 font-medium">
                  {generatedSubject}
                </p>
              </div>
            </div>
          )}
          
          <div className="mb-4 animate-slideIn">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Email Content
            </label>
            <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-md border border-surface-200 dark:border-surface-700">
              <p className="text-surface-900 dark:text-surface-100 whitespace-pre-wrap">
                {response}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 animate-fadeIn">
            <Button
              onClick={handleCopy}
              variant="outline"
              icon={copySuccess ? <span>✓</span> : <span>📋</span>}
              className="hover:scale-105 transition-all"
            >
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              onClick={() => onOpenGmail(response, generatedSubject)}
              variant="outline"
              icon={<span>📧</span>}
              className="hover:scale-105 transition-all"
            >
              Open in Gmail
            </Button>
            <Button
              onClick={onEditModeToggle}
              variant="outline"
              icon={<span>✏️</span>}
              className="hover:scale-105 transition-all"
            >
              Edit Email
            </Button>
          </div>
        </>
      )}
    </div>
  );
}