import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Card } from './ui';

// Component-level error boundary for isolated errors
function ComponentErrorBoundary({ children, componentName = 'Component' }) {
  return (
    <ErrorBoundary
      fallback={
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {componentName} Error
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                This component couldn't load properly. Try refreshing the page.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-700 dark:text-yellow-300 hover:underline"
            >
              Refresh
            </button>
          </div>
        </Card>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ComponentErrorBoundary;