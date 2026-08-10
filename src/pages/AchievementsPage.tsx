import React from 'react';
import type { Achievement, UserLevel, Subject } from '../types';
import { AchievementCard } from '../components/achievements/AchievementCard';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProgressionService } from '../services/progression';
import { Orbit, Sparkles } from 'lucide-react';

export interface AchievementsPageProps {
  achievements: Achievement[];
  userLevel: UserLevel;
  subjects: Subject[];
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({
  achievements,
  userLevel,
  subjects,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const xpPct = Math.round((userLevel.currentXp / userLevel.xpForNextLevel) * 100);

  const discoveredConstellations: { subjectName: string; unitName: string }[] = [];
  subjects.forEach((subj) => {
    subj.units.forEach((unit) => {
      const stats = ProgressionService.getUnitConstellationStatus(unit);
      if (stats.isDiscovered) {
        discoveredConstellations.push({
          subjectName: subj.name,
          unitName: unit.name,
        });
      }
    });
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-slate-100 animate-fadeIn space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
          Cosmic Milestones & RPG Progression
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Unlock constellations, supernovas, and rank badges.
        </p>
      </div>

      {/* User Level RPG Hero Card */}
      <Card className="p-6 border-purple-500/30 relative overflow-hidden bg-gradient-to-r from-[#10101d] via-[#141426] to-[#0c0c16]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold font-mono text-white text-xl shadow-xl shadow-purple-950/60">
              L{userLevel.level}
            </div>
            <div>
              <span className="block text-xs uppercase tracking-widest text-purple-400 font-mono font-semibold">
                LEVEL {userLevel.level} RANK
              </span>
              <h2 className="text-2xl font-bold text-white font-heading">{userLevel.title}</h2>
              <p className="text-xs text-amber-300 font-mono mt-0.5">
                NEXT RANK: {userLevel.nextRankTitle}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Level Progress</span>
              <span className="text-purple-300 font-semibold">{xpPct}%</span>
            </div>
            <ProgressBar value={xpPct} color="purple" size="md" />
            <span className="block text-[10px] text-right font-mono text-slate-500">
              {userLevel.currentXp} / {userLevel.xpForNextLevel} XP needed for Level {userLevel.level + 1}
            </span>
          </div>
        </div>
      </Card>

      {/* Discovered Constellations Section */}
      {discoveredConstellations.length > 0 && (
        <Card className="p-6 border-amber-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Orbit className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold font-heading text-white">Discovered Constellations</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {discoveredConstellations.map((item, idx) => (
              <div
                key={idx}
                className="bg-amber-950/20 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3 text-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-white block">{item.unitName}</span>
                  <span className="text-slate-400 text-[10px]">{item.subjectName}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Achievements Badge Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-heading text-white">All Badges & Trophies</h3>
          <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-full">
            {unlockedCount} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <AchievementCard key={ach.id} achievement={ach} />
          ))}
        </div>
      </div>
    </div>
  );
};
