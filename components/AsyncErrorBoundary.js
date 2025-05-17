import { useState } from 'react';
import { Button, Card } from './ui';

// For handling async errors in components
export function AsyncErrorBoundary({ children, onError }) {
  const [error, setError] = useState(null);
  
  // Reset error state
  const resetError = () => {
    setError(null);
    if (onError) {
      onError(null);
    }
  };
  
  // Handle async errors
  const handleAsyncError = (error) => {
    setError(error);
    if (onError) {
      onError(error);
    }
  };
  
  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
              Connection Error
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error.message || 'Failed to complete the request. Please try again.'}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetError}
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  // Pass the error handler to children
  return typeof children === 'function' 
    ? children({ handleAsyncError }) 
    : children;
}

export default AsyncErrorBoundary;