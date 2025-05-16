import React from 'react';

// Button variants: primary, secondary, outline, danger, success, ghost
// Sizes: xs, sm, md, lg
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  className = '',
  disabled = false,
  isLoading = false,
  icon = null,
  onClick,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 focus:ring-primary-500 border border-transparent shadow-sm',
    secondary: 'bg-surface-200 text-surface-800 hover:bg-surface-300 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600 focus:ring-surface-400 border border-transparent',
    outline: 'bg-white text-surface-700 hover:bg-surface-50 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 border border-surface-300 dark:border-surface-600 focus:ring-primary-500',
    danger: 'bg-error-600 text-white hover:bg-error-700 dark:bg-error-700 dark:hover:bg-error-800 focus:ring-error-500 border border-transparent shadow-sm',
    success: 'bg-success-600 text-white hover:bg-success-700 dark:bg-success-700 dark:hover:bg-success-800 focus:ring-success-500 border border-transparent shadow-sm',
    ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-800 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200 focus:ring-primary-500 border border-transparent',
  };
  
  const sizeStyles = {
    xs: 'text-xs px-2.5 py-1.5',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };
  
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`;

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && !isLoading && <span className={children ? 'mr-2' : ''}>{icon}</span>}
      {children}
    </button>
  );
}