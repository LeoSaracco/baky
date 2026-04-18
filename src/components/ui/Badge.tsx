import React from 'react';
import { BadgeVariant } from '../../utils/badgeHelpers';

export { Badge };

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, string> = {
  pink: 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
  mint: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  lavender: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  peach: 'bg-red-500/10 text-red-300 border border-red-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20',
  gray: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  children,
  className = '',
  size = 'sm',
}) => {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${sizeClass} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
