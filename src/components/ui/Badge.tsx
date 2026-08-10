import React from 'react';
import { cn } from '../../utils/formatting';

export interface BadgeProps {
  variant?: 'purple' | 'blue' | 'teal' | 'gold' | 'gray' | 'danger';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'purple',
  children,
  className,
  icon,
}) => {
  const variantClasses = {
    purple: 'bg-purple-950/60 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-950/60 text-blue-300 border-blue-500/30',
    teal: 'bg-teal-950/60 text-teal-300 border-teal-500/30',
    gold: 'bg-amber-950/60 text-amber-300 border-amber-500/30',
    gray: 'bg-slate-900/60 text-slate-400 border-slate-700/40',
    danger: 'bg-red-950/60 text-red-300 border-red-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm',
        variantClasses[variant],
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
