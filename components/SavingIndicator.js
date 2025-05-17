import { useState, useEffect } from 'react';
import { Card } from './ui';

export function SavingIndicator({ status = 'idle', message = '', position = 'bottom-right' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setIsVisible(true);
      setFadeOut(false);
    }

    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setIsVisible(false), 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!isVisible) return null;

  const positions = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  const statusStyles = {
    saving: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    error: 'bg-gradient-to-r from-red-500 to-pink-500',
    idle: 'bg-gray-500'
  };

  const statusIcons = {
    saving: (
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
    success: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  const defaultMessages = {
    saving: 'Saving...',
    success: 'Saved successfully!',
    error: 'Failed to save'
  };

  return (
    <div className={`fixed ${positions[position]} z-50 transition-all duration-300 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className={`${statusStyles[status]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
        {statusIcons[status]}
        <span className="text-sm font-medium">
          {message || defaultMessages[status]}
        </span>
      </div>
    </div>
  );
}

// Hook for using the saving indicator
export function useSavingIndicator() {
  const [savingStatus, setSavingStatus] = useState('idle');
  const [savingMessage, setSavingMessage] = useState('');

  const startSaving = (message = '') => {
    setSavingStatus('saving');
    setSavingMessage(message);
  };

  const savingSuccess = (message = '') => {
    setSavingStatus('success');
    setSavingMessage(message);
  };

  const savingError = (message = '') => {
    setSavingStatus('error');
    setSavingMessage(message);
  };

  const resetSaving = () => {
    setSavingStatus('idle');
    setSavingMessage('');
  };

  return {
    savingStatus,
    savingMessage,
    startSaving,
    savingSuccess,
    savingError,
    resetSaving,
    SavingIndicator: (props) => (
      <SavingIndicator 
        status={savingStatus} 
        message={savingMessage} 
        {...props} 
      />
    )
  };
}

export default SavingIndicator;