import React, { useState, useEffect } from 'react';
import Button from './Button';
import TextArea from './TextArea';

export default function EmailDisplay({ 
  email,
  onCopy,
  onOpenInGmail,
  onDownload,
  onEdit,
  editable = false,
  className = '',
  showHeader = true,
  autoSave = false
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(email);
  const [isSaving, setIsSaving] = useState(false);

  // Update edited content when email prop changes
  useEffect(() => {
    setEditedContent(email);
  }, [email]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onEdit) {
        await onEdit(editedContent);
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when content changes and autoSave is enabled
  useEffect(() => {
    const saveChanges = async () => {
      if (autoSave && editedContent !== email && !isSaving && onEdit) {
        setIsSaving(true);
        try {
          await onEdit(editedContent);
        } catch (err) {
          console.error("Failed to auto-save:", err);
        } finally {
          setIsSaving(false);
        }
      }
    };

    // Use a debounce to avoid saving on every keystroke
    const debounceTimer = setTimeout(saveChanges, 1000);
    return () => clearTimeout(debounceTimer);
  }, [editedContent, autoSave, email, onEdit, isSaving]);

  return (
    <div className={`bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden ${className}`}>
      {showHeader && (
        <div className="border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-medium text-surface-900 dark:text-surface-300">Email Content</h3>
          {editable && !isEditing && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsEditing(true)}
              icon={
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
            >
              Edit
            </Button>
          )}
        </div>
      )}
      
      {isEditing ? (
        <div className="p-4">
          <TextArea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={8}
            className="w-full"
          />
          <div className="mt-3 flex space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              isLoading={isSaving}
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditedContent(email);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-white dark:bg-surface-800 rounded-md text-sm whitespace-pre-wrap dark:text-surface-200">
          {editedContent}
        </div>
      )}
      
      <div className="px-4 py-3 bg-surface-50 dark:bg-surface-800/50 border-t border-surface-200 dark:border-surface-700 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopy(editedContent)}
          icon={
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2" />
            </svg>
          }
        >
          Copy
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenInGmail(editedContent)}
          icon={
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        >
          Gmail
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(editedContent)}
          icon={
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Download
        </Button>
        {editable && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            icon={
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            }
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}