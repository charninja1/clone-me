import React from 'react';

export default function Checkbox({
  id,
  name,
  checked,
  onChange,
  label,
  description,
  error,
  className = '',
  disabled = false,
  required = false,
  ...props
}) {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="checkbox"
          className={`h-4 w-4 rounded 
            ${error 
              ? 'border-error-300 text-error-600 focus:ring-error-500 dark:border-error-700 dark:text-error-500' 
              : 'border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:text-primary-500 dark:focus:ring-primary-600'
            } 
            disabled:opacity-50 disabled:cursor-not-allowed`}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      <div className="ml-3 text-sm">
        {label && (
          <label htmlFor={id} className={`font-medium ${disabled ? 'text-surface-400 dark:text-surface-500' : 'text-surface-700 dark:text-surface-300'}`}>
            {label}
            {required && <span className="text-error-600 dark:text-error-400 ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className={`${label ? 'mt-1' : ''} text-surface-500 dark:text-surface-400`}>{description}</p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-error-600 dark:text-error-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}