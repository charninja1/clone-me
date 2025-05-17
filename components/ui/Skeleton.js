import React from 'react';

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  animation = true 
}) {
  const baseClasses = `bg-surface-200 dark:bg-surface-700 rounded ${animation ? 'animate-pulse' : ''}`;
  
  const variantClasses = {
    text: 'h-4 rounded',
    title: 'h-8 rounded',
    circle: 'rounded-full',
    rectangular: 'rounded-lg',
    button: 'h-10 rounded-lg'
  };
  
  const sizeStyles = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'circle' ? '40px' : variantClasses[variant].includes('h-') ? '' : '100%')
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={sizeStyles}
      aria-label="Loading..."
    />
  );
}