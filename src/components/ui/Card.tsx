import React from 'react';
import { cn } from '../../utils/formatting';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glowColor?: 'purple' | 'blue' | 'teal' | 'gold' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glowColor = 'none',
  className,
  ...props
}) => {
  const glowClasses = {
    purple: 'hover:border-purple-500/40 hover:shadow-[0_0_25px_-5px_rgba(168,85,247,0.3)]',
    blue: 'hover:border-blue-500/40 hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]',
    teal: 'hover:border-teal-500/40 hover:shadow-[0_0_25px_-5px_rgba(20,184,166,0.3)]',
    gold: 'hover:border-amber-500/40 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-[#101017]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl transition-all duration-300',
        hoverEffect && 'hover:-translate-y-0.5 cursor-pointer',
        glowColor !== 'none' && glowClasses[glowColor],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
