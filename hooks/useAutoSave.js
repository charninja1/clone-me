import { useEffect, useRef, useState } from 'react';
import { useSavingIndicator } from '../components/SavingIndicator';

export function useAutoSave({
  data,
  onSave,
  enabled = true,
  delay = 2000,
  immediate = false
}) {
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const timeoutRef = useRef(null);
  const previousDataRef = useRef(data);
  const { 
    startSaving, 
    savingSuccess, 
    savingError, 
    SavingIndicator 
  } = useSavingIndicator();

  // Track if data has changed
  useEffect(() => {
    if (!enabled) return;

    const hasChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);
    
    if (hasChanged) {
      setIsDirty(true);
      previousDataRef.current = data;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Start saving indicator if immediate
      if (immediate) {
        startSaving();
      }

      // Set new timeout for auto-save
      timeoutRef.current = setTimeout(async () => {
        if (!immediate) {
          startSaving();
        }

        try {
          await onSave(data);
          setLastSaved(new Date());
          setIsDirty(false);
          savingSuccess();
        } catch (error) {
          console.error('Auto-save failed:', error);
          savingError('Failed to save changes');
        }
      }, immediate ? 0 : delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, immediate, onSave, startSaving, savingSuccess, savingError]);

  // Manual save function
  const saveNow = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    startSaving();
    
    try {
      await onSave(data);
      setLastSaved(new Date());
      setIsDirty(false);
      savingSuccess();
    } catch (error) {
      console.error('Manual save failed:', error);
      savingError('Failed to save changes');
      throw error;
    }
  };

  return {
    isDirty,
    lastSaved,
    saveNow,
    SavingIndicator
  };
}

// Debounced version of auto-save
export function useDebouncedAutoSave(props) {
  return useAutoSave({ ...props, immediate: false });
}

// Immediate version of auto-save
export function useImmediateAutoSave(props) {
  return useAutoSave({ ...props, immediate: true });
}

export default useAutoSave;