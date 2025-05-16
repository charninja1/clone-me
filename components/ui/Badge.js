import React from 'react';

// Badge variants: default, primary, success, warning, error
// Sizes: sm, md, lg
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200 border-surface-200 dark:border-surface-700',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200 border-primary-200 dark:border-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-200 border-secondary-200 dark:border-secondary-800',
    success: 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-200 border-success-200 dark:border-success-800',
    warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-200 border-warning-200 dark:border-warning-800',
    error: 'bg-error-100 text-error-800 dark:bg-error-900/30 dark:text-error-200 border-error-200 dark:border-error-800',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
}