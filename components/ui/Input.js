import React, { useState } from 'react';

export default function Input({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  label,
  error,
  helpText,
  className = '',
  disabled = false,
  required = false,
  ...props
}) {
  // State for password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the actual input type (for password toggle)
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
          {label}
          {required && <span className="text-error-600 dark:text-error-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          className={`block w-full rounded-md shadow-sm ${
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-500 dark:border-error-700 dark:focus:border-error-600 dark:focus:ring-error-600'
              : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500 dark:border-surface-600 dark:focus:border-primary-600 dark:focus:ring-primary-600'
          } focus:ring focus:ring-opacity-50 disabled:opacity-50 disabled:bg-surface-100 disabled:cursor-not-allowed dark:bg-surface-800 dark:text-surface-200 dark:disabled:bg-surface-900 dark:placeholder-surface-400 ${
            props.startIcon ? 'pl-10' : ''
          } ${type === 'password' ? 'pr-10' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
          {...props}
        />
        
        {/* Show start icon if provided */}
        {props.startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-surface-500 dark:text-surface-400 sm:text-sm">{props.startIcon}</span>
          </div>
        )}
        
        {/* Password visibility toggle button */}
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-500 dark:text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 focus:outline-none"
            onClick={togglePasswordVisibility}
            tabIndex="-1" // Prevent focus with keyboard navigation
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
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