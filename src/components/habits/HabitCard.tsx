import React from 'react';
import type { Habit, HabitCompletion } from '../../types';
import { HabitService } from '../../services/habitService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatTime24To12 } from '../../utils/formatting';
import { Repeat, CheckSquare, Square, Zap, Flame, Clock, Sparkles } from 'lucide-react';

export interface HabitCardProps {
  habit: Habit;
  completions: HabitCompletion[];
  dateStr: string;
  onToggleCompletion: (habitId: string, dateStr: string) => void;
  onLaunchFocus?: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
  onClickDetail: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completions,
  dateStr,
  onToggleCompletion,
  onLaunchFocus,
  onClickDetail,
}) => {
  const isCompleted = !!HabitService.getHabitCompletion(completions, habit.id, dateStr);
  const streak = HabitService.calculateHabitStreak(habit, completions);

  return (
    <div
      className={`p-4 rounded-2xl border backdrop-blur-md transition-all ${
        isCompleted
          ? 'bg-purple-950/20 border-purple-500/40 opacity-80'
          : habit.isPaused
          ? 'bg-[#101018]/50 border-white/5 opacity-50'
          : 'bg-[#121222]/90 border-white/10 hover:border-purple-500/40'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Checkbox & Title Info */}
        <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => onClickDetail(habit)}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompletion(habit.id, dateStr);
            }}
            className="mt-0.5 text-slate-400 hover:text-purple-400 cursor-pointer shrink-0"
          >
            {isCompleted ? (
              <CheckSquare className="w-5 h-5 text-purple-400 fill-purple-950" />
            ) : (
              <Square className="w-5 h-5 text-slate-500 hover:text-purple-300" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">🔁</span>
              <h4 className={`font-semibold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                {habit.title}
              </h4>
              {habit.isPaused && <Badge variant="gray">Paused</Badge>}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>
                {habit.type === 'time_based'
                  ? `${habit.targetValue} min focus`
                  : habit.type === 'count_based'
                  ? `${habit.targetValue} target`
                  : 'Check-in'}
              </span>
              <span>• {habit.frequency}</span>
              {habit.preferredTime && <span>• {formatTime24To12(habit.preferredTime)}</span>}

              {streak.currentStreak > 0 && (
                <span className="text-amber-400 font-mono font-semibold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {streak.currentStreak}-day streak
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {habit.type === 'time_based' && habit.subjectId && !isCompleted && onLaunchFocus && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onLaunchFocus(habit.subjectId!, undefined, habit.targetValue || 45, habit.goalId, habit.id)}
              icon={<Zap className="w-3.5 h-3.5 text-purple-300" />}
            >
              Start Focus
            </Button>
          )}

          {!isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleCompletion(habit.id, dateStr)}
            >
              Complete
            </Button>
          ) : (
            <Badge variant="purple" icon={<Sparkles className="w-3 h-3" />}>
              ✓ Routine Complete
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
