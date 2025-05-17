import React, { createContext, useContext, useState, useCallback } from 'react';

const SavingContext = createContext();

export function SavingProvider({ children }) {
  const [savingStates, setSavingStates] = useState({});

  const updateSavingState = useCallback((key, status, message = '') => {
    setSavingStates(prev => ({
      ...prev,
      [key]: { status, message, timestamp: Date.now() }
    }));

    // Auto-clear success/error states after 3 seconds
    if (status === 'success' || status === 'error') {
      setTimeout(() => {
        setSavingStates(prev => {
          const newState = { ...prev };
          if (newState[key]?.status === status) {
            delete newState[key];
          }
          return newState;
        });
      }, 3000);
    }
  }, []);

  const startSaving = useCallback((key, message) => {
    updateSavingState(key, 'saving', message);
  }, [updateSavingState]);

  const savingSuccess = useCallback((key, message) => {
    updateSavingState(key, 'success', message);
  }, [updateSavingState]);

  const savingError = useCallback((key, message) => {
    updateSavingState(key, 'error', message);
  }, [updateSavingState]);

  const clearSaving = useCallback((key) => {
    setSavingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const value = {
    savingStates,
    startSaving,
    savingSuccess,
    savingError,
    clearSaving
  };

  return (
    <SavingContext.Provider value={value}>
      {children}
    </SavingContext.Provider>
  );
}

export function useSaving(key) {
  const context = useContext(SavingContext);
  
  if (!context) {
    throw new Error('useSaving must be used within a SavingProvider');
  }

  const { savingStates, startSaving, savingSuccess, savingError, clearSaving } = context;
  const state = savingStates[key] || { status: 'idle', message: '' };

  return {
    status: state.status,
    message: state.message,
    startSaving: (message) => startSaving(key, message),
    savingSuccess: (message) => savingSuccess(key, message),
    savingError: (message) => savingError(key, message),
    clearSaving: () => clearSaving(key)
  };
}

export default SavingContext;