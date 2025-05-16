import React, { useState } from 'react';

export default function Select({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = '-- Select --',
  label,
  error,
  helpText,
  className = '',
  disabled = false,
  required = false,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={id} 
          className={`
            block text-sm font-medium mb-2 transition-colors duration-200
            ${isFocused ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}
          `}
        >
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
          className={`
            block w-full rounded-xl shadow-sm transition-all duration-200
            px-4 py-3 pr-10 text-sm appearance-none
            ${error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500 dark:border-error-700 dark:focus:border-error-600 dark:focus:ring-error-600'
              : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500 dark:border-surface-600 dark:focus:border-primary-600 dark:focus:ring-primary-600'
            }
            focus:ring-2 focus:ring-opacity-30 focus:outline-none
            hover:border-surface-400 dark:hover:border-surface-500
            disabled:opacity-50 disabled:bg-surface-100 disabled:cursor-not-allowed 
            dark:bg-surface-800 dark:text-surface-200 dark:disabled:bg-surface-900
            cursor-pointer
          `}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg 
            className={`
              h-5 w-5 transition-colors duration-200
              ${isFocused ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'}
            `}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-error-600 dark:text-error-400" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="mt-2 text-sm text-surface-500 dark:text-surface-400">
          {helpText}
        </p>
      )}
    </div>
  );
}