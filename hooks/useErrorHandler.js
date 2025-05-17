import { useCallback } from 'react';

export function useErrorHandler() {
  const handleError = useCallback((error, context = 'Unknown') => {
    console.error(`Error in ${context}:`, error);
    
    // You could also send to an error tracking service here
    // if (window.errorTrackingService) {
    //   window.errorTrackingService.logError(error, { context });
    // }
    
    // Show user-friendly error message
    const message = error?.message || 'An unexpected error occurred';
    
    // Could integrate with a toast notification system
    // toast.error(message);
    
    return message;
  }, []);
  
  const asyncHandler = useCallback((asyncFn, context) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        handleError(error, context);
        throw error; // Re-throw to let error boundaries catch it
      }
    };
  }, [handleError]);
  
  return { handleError, asyncHandler };
}