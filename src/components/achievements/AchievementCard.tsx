import React from 'react';
import { Achievement } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Sparkles, Globe, Star, Orbit, Zap, Moon, Flame, Compass, Trophy, Lock } from 'lucide-react';

export interface AchievementCardProps {
  achievement: Achievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'Globe':
        return <Globe className="w-5 h-5" />;
      case 'Star':
        return <Star className="w-5 h-5" />;
      case 'Orbit':
        return <Orbit className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Moon':
        return <Moon className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5" />;
      case 'Compass':
        return <Compass className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const progressPct = Math.round((achievement.progress / achievement.maxProgress) * 100);

  return (
    <Card
      className={`p-5 relative overflow-hidden transition-all duration-300 ${
        achievement.unlocked
          ? 'border-amber-500/40 bg-amber-950/10 shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)]'
          : 'opacity-70 border-white/10 grayscale-[0.3]'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            achievement.unlocked
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-950/50'
              : 'bg-[#141424] border-white/10 text-slate-500'
          }`}
        >
          {achievement.unlocked ? getIcon(achievement.icon) : <Lock className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-white truncate">{achievement.title}</h4>
            {achievement.unlocked ? (
              <Badge variant="gold">Unlocked ✦</Badge>
            ) : (
              <Badge variant="gray">Locked</Badge>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">{achievement.description}</p>

          {!achievement.unlocked && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>Progress</span>
                <span>
                  {achievement.progress} / {achievement.maxProgress}
                </span>
              </div>
              <ProgressBar value={progressPct} color="gold" size="sm" />
            </div>
          )}

          {achievement.unlocked && achievement.unlockedAt && (
            <span className="block text-[10px] font-mono text-amber-400/80">
              Unlocked on {achievement.unlockedAt}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
