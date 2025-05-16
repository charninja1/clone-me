import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  border = true,
  hover = true,
  variant = 'default',
  ...props 
}) {
  const paddingMap = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };
  
  const shadowMap = {
    none: '',
    default: 'shadow-sm',
    md: 'shadow-md', 
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };
  
  const variantStyles = {
    default: 'bg-white dark:bg-surface-800',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-white to-surface-50 dark:from-surface-800 dark:to-surface-900',
  };
  
  const baseStyles = `
    rounded-xl transition-all duration-300 ease-in-out
    ${variantStyles[variant]}
  `;
  
  const borderStyles = border ? 'border border-surface-200 dark:border-surface-700' : '';
  const paddingStyles = paddingMap[padding];
  const shadowStyles = shadowMap[shadow];
  
  const hoverStyles = hover ? `
    hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800
    hover:-translate-y-1
  ` : '';
  
  return (
    <div 
      className={`${baseStyles} ${borderStyles} ${paddingStyles} ${shadowStyles} ${hoverStyles} ${className}`}
      style={{ '--shadow': shadow !== 'none' ? `var(--shadow-${shadow})` : 'none' }}
      {...props}
    >
      {children}
    </div>
  );
}