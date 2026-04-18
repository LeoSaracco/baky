import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: 'pink' | 'mint' | 'lavender' | 'yellow';
  trend?: { value: string; positive: boolean };
  subtitle?: string;
  className?: string;
}

const iconColorMap = {
  pink: 'bg-pink-500/10 text-pink-400',
  mint: 'bg-emerald-500/10 text-emerald-400',
  lavender: 'bg-purple-500/10 text-purple-300',
  yellow: 'bg-yellow-500/10 text-yellow-300',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon,
  iconColor = 'pink',
  trend,
  subtitle,
  className = '',
}) => {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconColorMap[iconColor]}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.positive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide mb-1">{title}</p>
      <p className="text-2xl font-bold text-[var(--text-primary)] mono">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-secondary)] mt-1">{subtitle}</p>}
    </div>
  );
};
