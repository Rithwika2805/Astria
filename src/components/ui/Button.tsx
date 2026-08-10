import React from 'react';
import { cn } from '../../utils/formatting';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5 font-semibold',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/40 border border-purple-400/30',
    secondary:
      'bg-[#14141d] hover:bg-[#1c1c28] text-slate-200 border border-white/10 hover:border-purple-500/30',
    outline:
      'bg-transparent border border-purple-500/30 hover:border-purple-500 text-purple-300 hover:bg-purple-950/30',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
    gold:
      'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-semibold shadow-lg shadow-amber-950/40 border border-amber-300/40',
    danger:
      'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30',
  };

  return (
    <button
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
