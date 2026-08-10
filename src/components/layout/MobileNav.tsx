import React from 'react';
import { Compass, Calendar, Zap, BarChart2 } from 'lucide-react';
import { ActiveTab } from '../../store/useAppStore';
import { cn } from '../../utils/formatting';

export interface MobileNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const items: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'galaxy', label: 'Galaxy', icon: <Compass className="w-5 h-5" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-5 h-5" /> },
    { id: 'focus', label: 'Focus', icon: <Zap className="w-5 h-5" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080810]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer',
                isActive ? 'text-purple-400 font-semibold' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-xl transition-all',
                  isActive && 'bg-purple-950/60 border border-purple-500/40 shadow-sm shadow-purple-950/50'
                )}
              >
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
