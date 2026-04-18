import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-4 py-2 hover:bg-red-500/20 transition-all',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: '', // base size
    lg: 'text-base px-6 py-3',
  };

  const currentVariantClass = variants[variant];
  const currentSizeClass = sizeClasses[size];

  return (
    <button
      className={`inline-flex items-center gap-2 font-medium transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${currentVariantClass} ${currentSizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={`w-4 h-4 border-2 rounded-full animate-spin ${variant === 'danger' ? 'border-red-400/30 border-t-red-400' : 'border-white/30 border-t-white'}`} />
      ) : icon}
      {children}
      {iconRight && !loading && iconRight}
    </button>
  );
};
