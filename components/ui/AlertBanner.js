import React from 'react';

// Alert types: info, success, warning, error
export default function AlertBanner({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  ...props
}) {
  const typeStyles = {
    info: {
      container: 'bg-primary-50 border-primary-200 text-primary-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary-500">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      ),
    },
    success: {
      container: 'bg-success-50 border-success-200 text-success-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-success-500">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      ),
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 text-warning-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-warning-500">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    error: {
      container: 'bg-error-50 border-error-200 text-error-800',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-error-500">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const { container, icon } = typeStyles[type];

  return (
    <div className={`p-4 border rounded-md ${container} ${className}`} role="alert" {...props}>
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              {title && <h3 className="text-sm font-medium">{title}</h3>}
              {message && <div className={`${title ? 'mt-1' : ''} text-sm`}>{message}</div>}
            </div>
            {onClose && (
              <button
                type="button"
                className="ml-6 rounded-md inline-flex text-surface-500 hover:text-surface-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={onClose}
                aria-label="Dismiss"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}