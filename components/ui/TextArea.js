import React from 'react';

export default function TextArea({
  id,
  name,
  value,
  onChange,
  rows = 3,
  placeholder = '',
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
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 mb-1">
          {label}
          {required && <span className="text-error-600 ml-1">*</span>}
        </label>
      )}
      <div>
        <textarea
          id={id}
          name={name}
          rows={rows}
          className={`block w-full rounded-md shadow-sm ${
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500'
              : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500'
          } focus:ring focus:ring-opacity-50 disabled:opacity-50 disabled:bg-surface-100 disabled:cursor-not-allowed`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-error-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="mt-1 text-sm text-surface-500">
          {helpText}
        </p>
      )}
    </div>
  );
}