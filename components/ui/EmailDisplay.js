import React from 'react';
import Button from './Button';

export default function EmailDisplay({ 
  email,
  onCopy,
  onOpenInGmail,
  onDownload,
  className = '',
  showHeader = true
}) {
  return (
    <div className={`bg-white rounded-lg border border-surface-200 shadow-sm overflow-hidden ${className}`}>
      {showHeader && (
        <div className="border-b border-surface-200 bg-surface-50 px-4 py-3">
          <h3 className="text-sm font-medium text-surface-900">Email Content</h3>
        </div>
      )}
      <div className="p-4 bg-white rounded-md text-sm whitespace-pre-wrap">
        {email}
      </div>
      <div className="px-4 py-3 bg-surface-50 border-t border-surface-200 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
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
          onClick={onOpenInGmail}
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
          onClick={onDownload}
          icon={
            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Download
        </Button>
      </div>
    </div>
  );
}