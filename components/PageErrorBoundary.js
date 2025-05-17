import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Layout } from './';

// Page-level error boundary that maintains the layout
function PageErrorBoundary({ children, showDetails = true }) {
  return (
    <ErrorBoundary
      showDetails={showDetails}
      fallback={
        <Layout>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full mb-4">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                Page Error
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                This page encountered an error and couldn't load properly. 
                Please try refreshing or return to the homepage.
              </p>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
                >
                  Refresh Page
                </button>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </Layout>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default PageErrorBoundary;