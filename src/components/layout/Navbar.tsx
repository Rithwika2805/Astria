import React from 'react';
import {
  Compass,
  Calendar,
  Zap,
  BarChart2,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Flame,
  Search,
} from 'lucide-react';
import type { ActiveTab } from '../../store/useAppStore';
import type { UserLevel } from '../../types';
import { cn } from '../../utils/formatting';

export interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userLevel: UserLevel;
  streakCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userLevel,
  streakCount,
  soundEnabled,
  onToggleSound,
  onOpenSearch,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'galaxy', label: 'Galaxy', icon: <Compass className="w-4 h-4" /> },
    { id: 'planner', label: 'Planner', icon: <Calendar className="w-4 h-4" /> },
    { id: 'focus', label: 'Focus', icon: <Zap className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <BarChart2 className="w-4 h-4" /> },
  ];

  const secondaryNavItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050509]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('galaxy')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
            <span className="text-white text-lg font-bold">✦</span>
          </div>
          <div>
            <span className="text-lg font-bold font-heading tracking-wider bg-gradient-to-r from-white via-slate-200 to-purple-200 bg-clip-text text-transparent">
              Astria
            </span>
            <span className="block text-[10px] tracking-widest uppercase text-purple-400/80 -mt-1 font-mono">
              Universe Planner
            </span>
          </div>
        </div>

        {/* Desktop Primary Navigation Portals */}
        <nav className="hidden md:flex items-center gap-1 bg-[#101018]/90 p-1.5 rounded-2xl border border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'bg-purple-600/40 text-purple-200 border border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-[#10101a] border border-white/10 hover:border-purple-500/40 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Search...</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Streak Indicator */}
          <div
            title="Daily Study Streak"
            className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
            <span>{streakCount} d</span>
          </div>

          {/* User Level Badge */}
          <div
            onClick={() => setActiveTab('achievements')}
            title={`${userLevel.currentXp} / ${userLevel.xpForNextLevel} Cosmic Energy`}
            className="hidden sm:flex items-center gap-2 bg-purple-950/40 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer hover:bg-purple-900/40 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="font-semibold">Lvl {userLevel.level}</span>
            <span className="text-purple-400/80 font-normal hidden lg:inline">{userLevel.title}</span>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center gap-1">
            {secondaryNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                className={cn(
                  'p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer',
                  activeTab === item.id && 'text-purple-300 bg-purple-950/40 border border-purple-500/30'
                )}
              >
                {item.icon}
              </button>
            ))}

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
