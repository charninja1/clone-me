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
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const variantStyles = {
    default: 'bg-surface-100 text-surface-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    error: 'bg-error-100 text-error-800',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-0.5 text-base',
  };
  
  const badgeClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
}