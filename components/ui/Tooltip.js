import React, { useState } from 'react';

const Tooltip = ({ children, content, position = 'top', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-800 dark:border-t-surface-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-800 dark:border-b-surface-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-800 dark:border-l-surface-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-800 dark:border-r-surface-700'
  };
  
  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 text-sm bg-surface-800 dark:bg-surface-700 text-white rounded-lg shadow-lg transition-all duration-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${positionClasses[position]}`}
          style={{ whiteSpace: 'nowrap' }}
        >
          {content}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;