import React from 'react';

const InfoCard = ({ title, description, icon, variant = 'info', actions, className = '' }) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="text-2xl flex-shrink-0">{icon}</div>
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          {description && (
            <p className="text-sm">{description}</p>
          )}
          {actions && (
            <div className="mt-3">{actions}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoCard;