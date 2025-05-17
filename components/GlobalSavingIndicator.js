import { useContext } from 'react';
import SavingContext from '../contexts/SavingContext';
import { Card } from './ui';

export function GlobalSavingIndicator() {
  const { savingStates } = useContext(SavingContext);
  
  const activeSaves = Object.entries(savingStates).filter(
    ([_, state]) => state.status !== 'idle'
  );

  if (activeSaves.length === 0) return null;

  const statusIcons = {
    saving: (
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ),
    success: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  const statusColors = {
    saving: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400'
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-xs">
      {activeSaves.map(([key, state], index) => (
        <Card
          key={`${key}-${state.timestamp}`}
          className={`
            p-3 shadow-lg animate-slideInLeft
            ${state.status === 'saving' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' : ''}
            ${state.status === 'success' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20' : ''}
            ${state.status === 'error' ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20' : ''}
          `}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={statusColors[state.status]}>
              {statusIcons[state.status]}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${statusColors[state.status]}`}>
                {state.message || (
                  state.status === 'saving' ? 'Saving...' :
                  state.status === 'success' ? 'Saved!' :
                  'Failed to save'
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default GlobalSavingIndicator;