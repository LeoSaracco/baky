import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      {icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-[var(--pink-400)]"
          style={{ background: 'var(--pink-glow)', border: '1px solid var(--border-subtle)' }}
        >
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
};
