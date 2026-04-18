import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  selected = false,
  noPadding = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`card ${noPadding ? '' : 'p-5'} ${
        selected ? 'border-[var(--border-active)] -translate-y-0.5 shadow-[var(--shadow-pink)]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={selected ? { borderLeftWidth: 3, borderLeftColor: 'var(--pink-500)' } : {}}
    >
      {children}
    </div>
  );
};
