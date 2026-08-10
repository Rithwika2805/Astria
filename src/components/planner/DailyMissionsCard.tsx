import React, { useState } from 'react';
import type { StudyPlan, Goal, Habit, HabitCompletion, Subject } from '../../types';
import { HabitService } from '../../services/habitService';
import { HabitCard } from '../habits/HabitCard';
import { HabitDetailModal } from '../habits/HabitDetailModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatTime24To12 } from '../../utils/formatting';
import { CheckSquare, Square, Zap, Calendar, Sparkles, Target, Repeat, Plus } from 'lucide-react';

export interface DailyMissionsCardProps {
  plans: StudyPlan[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  subjects: Subject[];
  sessions: any[];
  onToggleCompletePlan: (planId: string) => void;
  onToggleHabitCompletion: (habitId: string, dateStr?: string) => void;
  onTogglePauseHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
  onOpenAddPlan: () => void;
  onOpenCreateHabit: () => void;
  onOpenRandomMission?: () => void;
}

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  plans,
  goals,
  habits,
  habitCompletions,
  subjects,
  sessions,
  onToggleCompletePlan,
  onToggleHabitCompletion,
  onTogglePauseHabit,
  onDeleteHabit,
  onLaunchFocus,
  onOpenAddPlan,
  onOpenCreateHabit,
  onOpenRandomMission,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPlans = plans.filter((p) => p.date === todayStr);

  const todaysHabits = habits.filter((h) => HabitService.isHabitDueOnDate(h, todayStr));
  const completedHabitsCount = todaysHabits.filter((h) => !!HabitService.getHabitCompletion(habitCompletions, h.id, todayStr)).length;

  const [selectedDetailHabit, setSelectedDetailHabit] = useState<Habit | null>(null);

  return (
    <div className="space-y-6">
      {/* SECTION 1: TODAY'S ROUTINES (HABITS) */}
      <Card className="border border-purple-500/30 bg-[#0e0e1c]/90 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white font-heading tracking-wide text-base">
              TODAY'S ROUTINES (HABITS)
            </h3>
            <Badge variant="purple" className="font-mono">
              {completedHabitsCount} / {todaysHabits.length}
            </Badge>
          </div>

          <Button variant="secondary" size="sm" onClick={onOpenCreateHabit} icon={<Plus className="w-3.5 h-3.5" />}>
            + Create Habit
          </Button>
        </div>

        {todaysHabits.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-[#090912] rounded-xl border border-white/5">
            <p>No routines scheduled for today.</p>
            <button
              onClick={onOpenCreateHabit}
              className="text-purple-400 hover:text-purple-300 font-medium underline mt-1 cursor-pointer"
            >
              Build your first repeated daily habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={habitCompletions}
                dateStr={todayStr}
                onToggleCompletion={onToggleHabitCompletion}
                onLaunchFocus={onLaunchFocus}
                onClickDetail={(h) => setSelectedDetailHabit(h)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* SECTION 2: TODAY'S MISSIONS (SPECIFIC PLANNED BLOCKS) */}
      <Card className="border border-white/10 bg-[#0d0d18]/90 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white font-heading tracking-wide text-base">
              TODAY'S MISSIONS (PLANNED BLOCKS)
            </h3>
            <Badge variant="teal" className="font-mono">
              {todaysPlans.filter((p) => p.completed).length} / {todaysPlans.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRandomMission && (
              <Button variant="ghost" size="sm" onClick={onOpenRandomMission} icon={<Sparkles className="w-3.5 h-3.5" />}>
                Choose for me
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onOpenAddPlan}>
              + Add Mission Block
            </Button>
          </div>
        </div>

        {todaysPlans.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-[#090912] rounded-xl border border-white/5">
            <p>No specific study missions scheduled for today.</p>
            <button
              onClick={onOpenAddPlan}
              className="text-purple-400 hover:text-purple-300 font-medium underline mt-1 cursor-pointer"
            >
              Schedule a study block mission
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysPlans.map((plan) => {
              const isDone = plan.completed;
              const linkedGoal = goals.find((g) => g.id === plan.goalId);

              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-teal-950/20 border-teal-500/40 opacity-75'
                      : 'bg-[#141424] border-white/10 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleCompletePlan(plan.id)}
                        className="mt-0.5 text-slate-400 hover:text-purple-400 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-teal-400 fill-teal-950" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold text-sm ${
                              isDone ? 'line-through text-slate-400' : 'text-white'
                            }`}
                          >
                            🚀 {plan.topicName || plan.subjectName}
                          </h4>
                          {plan.priority === 'High' && <Badge variant="gold">High Priority</Badge>}
                        </div>

                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                          <span>🪐 {plan.subjectName}</span>
                          <span>• {formatTime24To12(plan.startTime)}</span>
                          <span>• {plan.duration}m (+{plan.duration} Energy)</span>
                        </div>

                        {linkedGoal && (
                          <div className="mt-2 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-amber-400" />
                            <span>🎯 Goal: {linkedGoal.title}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isDone ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onLaunchFocus(plan.subjectId, plan.topicId, plan.duration, plan.goalId)}
                          icon={<Zap className="w-3.5 h-3.5 fill-purple-200" />}
                        >
                          Launch Focus
                        </Button>
                      ) : (
                        <Badge variant="teal" icon={<Sparkles className="w-3 h-3" />}>
                          ✓ Mission Complete (+{plan.duration} XP)
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Habit Detail Modal */}
      {selectedDetailHabit && (
        <HabitDetailModal
          isOpen={!!selectedDetailHabit}
          habit={selectedDetailHabit}
          completions={habitCompletions}
          subjects={subjects}
          goals={goals}
          sessions={sessions}
          onClose={() => setSelectedDetailHabit(null)}
          onTogglePause={onTogglePauseHabit}
          onDeleteHabit={onDeleteHabit}
        />
      )}
    </div>
  );
};
