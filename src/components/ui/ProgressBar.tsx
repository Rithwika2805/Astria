import React from 'react';
import { cn } from '../../utils/formatting';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'purple' | 'blue' | 'teal' | 'gold' | 'custom';
  customColorHex?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  labelPosition?: 'right' | 'top';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'purple',
  customColorHex,
  size = 'md',
  showLabel = false,
  labelPosition = 'right',
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillColors = {
    purple: 'bg-gradient-to-r from-purple-600 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]',
    teal: 'bg-gradient-to-r from-teal-600 to-emerald-500 shadow-[0_0_12px_rgba(20,184,166,0.5)]',
    gold: 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    custom: '',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-mono">
          <span>Progress</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-full bg-[#181824] rounded-full overflow-hidden border border-white/5 relative p-0.5',
            heightClasses[size]
          )}
        >
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              fillColors[color]
            )}
            style={{
              width: `${clampedValue}%`,
              backgroundColor: color === 'custom' ? customColorHex : undefined,
            }}
          />
        </div>
        {showLabel && labelPosition === 'right' && (
          <span className="text-xs font-mono font-medium text-slate-300 min-w-[2.5rem] text-right">
            {clampedValue}%
          </span>
        )}
      </div>
    </div>
  );
};
