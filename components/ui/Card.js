import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  border = true,
  ...props 
}) {
  const paddingMap = {
    none: '',
    sm: 'p-3',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const shadowMap = {
    none: '',
    default: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  const baseStyles = 'bg-white dark:bg-surface-800 rounded-lg transition-colors duration-200';
  const borderStyles = border ? 'border border-surface-200 dark:border-surface-700' : '';
  const paddingStyles = paddingMap[padding];
  const shadowStyles = shadowMap[shadow];
  
  return (
    <div 
      className={`${baseStyles} ${borderStyles} ${paddingStyles} ${shadowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}