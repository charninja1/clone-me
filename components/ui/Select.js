import React from 'react';

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
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={name}
          className={`block w-full rounded-md shadow-sm ${
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500 dark:border-error-700 dark:focus:border-error-600 dark:focus:ring-error-600'
              : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500 dark:border-surface-600 dark:focus:border-primary-600 dark:focus:ring-primary-600'
          } focus:ring focus:ring-opacity-50 disabled:opacity-50 disabled:bg-surface-100 disabled:cursor-not-allowed dark:bg-surface-800 dark:text-surface-200 dark:disabled:bg-surface-900`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
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
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-error-600 dark:text-error-400" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          {helpText}
        </p>
      )}
    </div>
  );
}