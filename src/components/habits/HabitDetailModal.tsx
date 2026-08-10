import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import type { Habit, HabitCompletion, Subject, Goal } from '../../types';
import { HabitService } from '../../services/habitService';
import { ProgressionService } from '../../services/progression';
import { formatTime24To12 } from '../../utils/formatting';
import { Repeat, Flame, Target, Pause, Play, Trash2, CheckCircle2, Circle } from 'lucide-react';

export interface HabitDetailModalProps {
  isOpen: boolean;
  habit: Habit;
  completions: HabitCompletion[];
  subjects: Subject[];
  goals: Goal[];
  sessions: any[];
  onClose: () => void;
  onTogglePause: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  isOpen,
  habit,
  completions,
  subjects,
  goals,
  sessions,
  onClose,
  onTogglePause,
  onDeleteHabit,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const streak = HabitService.calculateHabitStreak(habit, completions);
  const stats = HabitService.calculateHabitStats(habit, completions);

  const subject = subjects.find((s) => s.id === habit.subjectId);
  const goal = goals.find((g) => g.id === habit.goalId);

  // Generate last 14 days activity list
  const recentDays: { dateStr: string; dayLabel: string; isDue: boolean; isCompleted: boolean }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });

    const isDue = HabitService.isHabitDueOnDate(habit, dateStr);
    const comp = HabitService.getHabitCompletion(completions, habit.id, dateStr);

    recentDays.push({
      dateStr,
      dayLabel,
      isDue,
      isCompleted: !!comp,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit.title.toUpperCase()}
      subtitle={`${habit.type === 'time_based' ? `${habit.targetValue} minutes` : habit.type === 'count_based' ? `${habit.targetValue} count` : 'Check-in'} • ${habit.frequency} ${habit.preferredTime ? `• ${formatTime24To12(habit.preferredTime)}` : ''}`}
      maxWidth="md"
    >
      <div className="space-y-6 pt-2">
        {/* Habit Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141424] border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase block">CURRENT STREAK</span>
              <div className="flex items-center gap-1.5 text-xl font-bold font-mono text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
                <span>{streak.currentStreak} Days</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono uppercase block">THIS MONTH</span>
            <span className="text-lg font-bold font-mono text-white">
              {stats.thisMonthCompletions} / {stats.thisMonthScheduled}
            </span>
            <span className="text-xs font-mono text-purple-300 block">{stats.completionRate}% rate</span>
          </div>
        </div>

        {/* Linked Goal Progress */}
        {goal && (
          <div className="bg-[#10101a] border border-amber-500/30 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Target className="w-4 h-4 text-amber-400" />
                <span>CONTRIBUTES TO: {goal.title}</span>
              </div>
              <span className="font-mono text-amber-300 font-bold">
                {ProgressionService.calculateGoalProgress(goal, sessions, subjects).percentage}%
              </span>
            </div>
            <ProgressBar
              value={ProgressionService.calculateGoalProgress(goal, sessions, subjects).percentage}
              color="gold"
              size="sm"
            />
          </div>
        )}

        {/* Recent Activity Heatmap / 14-Day Strip */}
        <div>
          <span className="block text-xs font-mono uppercase text-slate-400 mb-2">
            Recent 14-Day Activity
          </span>
          <div className="grid grid-cols-14 gap-1.5 p-3 rounded-2xl bg-[#10101a] border border-white/10">
            {recentDays.map((d) => (
              <div key={d.dateStr} className="flex flex-col items-center gap-1" title={`${d.dateStr}: ${d.isCompleted ? 'Completed' : d.isDue ? 'Scheduled Missed' : 'Not Scheduled'}`}>
                <span className="text-[10px] font-mono text-slate-500">{d.dayLabel}</span>
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all ${
                    d.isCompleted
                      ? 'bg-purple-600 border border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                      : d.isDue
                      ? 'bg-[#181826] border border-white/10 text-slate-600'
                      : 'bg-transparent border border-white/5 text-slate-800 opacity-40'
                  }`}
                >
                  {d.isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : d.isDue ? (
                    <Circle className="w-3 h-3 text-slate-600" />
                  ) : (
                    <span className="text-[9px] text-slate-700">•</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTogglePause(habit.id)}
              icon={habit.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            >
              {habit.isPaused ? 'Resume Habit' : 'Pause Habit'}
            </Button>

            {!confirmDelete ? (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onDeleteHabit(habit.id);
                  onClose();
                }}
              >
                Confirm Delete
              </Button>
            )}
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
