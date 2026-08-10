import React from 'react';
import type { Subject, StudySession, Goal, UserSettings } from '../types';
import { ActivityChart } from '../components/progress/ActivityChart';
import { SubjectDistribution } from '../components/progress/SubjectDistribution';
import { InsightsList } from '../components/progress/InsightsList';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AnalyticsService } from '../services/analytics';
import { Clock, Calendar, Zap, Flame, BarChart2, Target } from 'lucide-react';

export interface ProgressPageProps {
  user: UserSettings;
  subjects: Subject[];
  sessions: StudySession[];
  goals: Goal[];
  streakCount: number;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  user,
  subjects,
  sessions,
  streakCount,
}) => {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);

  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalDuration = AnalyticsService.formatDuration(totalMinutes);

  const weekMinutes = sessions
    .filter((s) => new Date(s.startTime) >= weekAgo)
    .reduce((acc, s) => acc + s.duration, 0);
  const weekDuration = AnalyticsService.formatDuration(weekMinutes);

  const monthMinutes = sessions
    .filter((s) => new Date(s.startTime) >= monthAgo)
    .reduce((acc, s) => acc + s.duration, 0);
  const monthDuration = AnalyticsService.formatDuration(monthMinutes);

  const avgSessionMins =
    sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

  // Target progress calculations
  const todayStr = now.toISOString().split('T')[0];
  const todayMinutes = sessions
    .filter((s) => s.startTime.startsWith(todayStr))
    .reduce((a, s) => a + s.duration, 0);

  const dailyTarget = user.dailyTargetMinutes || 120;
  const dailyTargetPct = Math.min(100, Math.round((todayMinutes / dailyTarget) * 100));

  const weeklyTarget = user.weeklyTargetMinutes || 720;
  const weeklyTargetPct = Math.min(100, Math.round((weekMinutes / weeklyTarget) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-slate-100 animate-fadeIn space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
          Cosmic Velocity & Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Track study velocity, target momentum, peak focus hours, and subject distribution.
        </p>
      </div>

      {/* Daily & Weekly Target Progress Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-purple-500/30 bg-purple-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="font-semibold text-sm text-white">Daily Cosmic Target</span>
            </div>
            <span className="font-mono text-xs text-purple-300 font-bold">
              {todayMinutes}m / {dailyTarget}m
            </span>
          </div>
          <ProgressBar value={dailyTargetPct} color="purple" size="md" />
        </Card>

        <Card className="p-5 border-blue-500/30 bg-blue-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-sm text-white">Weekly Cosmic Target</span>
            </div>
            <span className="font-mono text-xs text-blue-300 font-bold">
              {Math.round(weekMinutes / 60)}h / {Math.round(weeklyTarget / 60)}h
            </span>
          </div>
          <ProgressBar value={weeklyTargetPct} color="blue" size="md" />
        </Card>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Total Time</span>
            <span className="text-lg font-bold text-white">{totalDuration.text}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">This Week</span>
            <span className="text-lg font-bold text-white">{weekDuration.text}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-300">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">This Month</span>
            <span className="text-lg font-bold text-white">{monthDuration.text}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Avg Session</span>
            <span className="text-lg font-bold text-white">{avgSessionMins}m</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <Flame className="w-5 h-5 fill-amber-400/30" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Streak</span>
            <span className="text-lg font-bold text-amber-300">{streakCount} Days</span>
          </div>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart sessions={sessions} />
        </div>
        <div>
          <SubjectDistribution subjects={subjects} sessions={sessions} />
        </div>
      </div>

      {/* Insights Section */}
      <InsightsList subjects={subjects} sessions={sessions} />
    </div>
  );
};
