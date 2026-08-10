import React, { useState } from 'react';
import type { StudyPlan, Subject, Goal, Habit, HabitCompletion } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { AnalyticsService } from '../../services/analytics';
import { formatTime24To12, formatDateLabel } from '../../utils/formatting';
import { Calendar as CalendarIcon, Plus, Zap, CheckSquare, Square, Trash2, Clock, AlertCircle, Target, Sparkles, Repeat } from 'lucide-react';

export interface PlannerCalendarProps {
  plans: StudyPlan[];
  subjects: Subject[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  sessions: any[];
  onToggleComplete: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
  onOpenAddPlanModal: () => void;
  onOpenCreateHabitModal: () => void;
}

export const PlannerCalendar: React.FC<PlannerCalendarProps> = ({
  plans,
  subjects,
  goals,
  habits,
  sessions,
  onToggleComplete,
  onDeletePlan,
  onLaunchFocus,
  onOpenAddPlanModal,
  onOpenCreateHabitModal,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysPlans = plans.filter((p) => p.date === todayStr);

  const recommendations = AnalyticsService.getSmartRecommendations(subjects, goals, sessions);

  const filteredPlans = plans.filter((p) => {
    if (filterPriority === 'all') return true;
    return p.priority === filterPriority;
  });

  const plansByDate = new Map<string, StudyPlan[]>();
  filteredPlans.forEach((plan) => {
    const list = plansByDate.get(plan.date) || [];
    list.push(plan);
    plansByDate.set(plan.date, list);
  });

  const sortedDates = Array.from(plansByDate.keys()).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-slate-100 animate-fadeIn space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
            Stellar Study Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Organize focus blocks, link mission objectives, and launch sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onOpenCreateHabitModal} icon={<Repeat className="w-4 h-4" />}>
            + Create Habit
          </Button>
          <Button variant="primary" onClick={onOpenAddPlanModal} icon={<Plus className="w-4 h-4" />}>
            Add Mission Block
          </Button>
        </div>
      </div>

      {/* TODAY'S MISSION CONTROL HERO WIDGET */}
      <Card className="p-6 border-purple-500/30 bg-gradient-to-r from-[#0e0e1a] via-[#121226] to-[#0a0a14] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-widest text-purple-300 font-semibold">
                TODAY'S MISSION CONTROL
              </span>
            </div>

            <h2 className="text-xl font-bold text-white font-heading">
              {todaysPlans.length} Missions Orbiting Today • {habits.length} Active Routines
            </h2>

            {todaysPlans.length > 0 && todaysPlans[0].goalId ? (
              <div className="mt-2 text-xs text-slate-300">
                <span className="text-slate-400">Primary Objective:</span>{' '}
                <span className="font-semibold text-white">{todaysPlans[0].topicName || todaysPlans[0].subjectName}</span>
                <div className="mt-1 font-mono text-amber-300">
                  🎯 Linked Goal: {goals.find((g) => g.id === todaysPlans[0].goalId)?.title || 'Subject Mastery'}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-1">
                Link daily missions and habits to long-term goals to see automatic progression feedback.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {todaysPlans.length > 0 && !todaysPlans[0].completed && (
              <Button
                variant="gold"
                size="lg"
                onClick={() =>
                  onLaunchFocus(
                    todaysPlans[0].subjectId,
                    todaysPlans[0].topicId,
                    todaysPlans[0].duration,
                    todaysPlans[0].goalId
                  )
                }
                icon={<Zap className="w-5 h-5 fill-slate-950" />}
              >
                Launch Primary Mission
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SMART STUDY RECOMMENDATIONS */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold block">
            Recommended Focus Missions
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="p-4 border-amber-500/30 bg-amber-950/10">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block mb-1">
                      {rec.reason}
                    </span>
                    <h4 className="font-semibold text-sm text-white">{rec.topicName}</h4>
                    <span className="text-xs text-slate-400">🪐 {rec.subjectName}</span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onLaunchFocus(rec.subjectId, rec.topicId, rec.suggestedDuration, rec.goalId)}
                    icon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Start {rec.suggestedDuration}m
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Total Missions</span>
            <span className="text-xl font-bold text-white">{plans.length}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-950/60 border border-teal-500/30 text-teal-300">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Completed</span>
            <span className="text-xl font-bold text-white">{plans.filter((p) => p.completed).length}</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400">Upcoming Minutes</span>
            <span className="text-xl font-bold text-white">
              {plans.filter((p) => !p.completed).reduce((a, b) => a + b.duration, 0)}m
            </span>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-center">
          <span className="block text-[10px] uppercase font-mono text-slate-400 mb-1">Filter Priority</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="High">High Priority Only</option>
            <option value="Medium">Medium Priority Only</option>
            <option value="Low">Low Priority Only</option>
          </select>
        </Card>
      </div>

      {/* Date Blocks Schedule */}
      {sortedDates.length === 0 ? (
        <Card className="py-12 text-center text-slate-400">
          <CalendarIcon className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">No Study Blocks Scheduled</h3>
          <p className="text-xs mb-4">Add your first mission block or habit routine to organize your cosmic journey.</p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="sm" onClick={onOpenCreateHabitModal}>
              Create Habit
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenAddPlanModal}>
              Add Mission Plan
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateStr) => {
            const datePlans = plansByDate.get(dateStr) || [];

            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <h3 className="text-sm font-mono uppercase font-bold text-purple-300 tracking-wider">
                    {formatDateLabel(dateStr)}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">({datePlans.length} missions)</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {datePlans.map((plan) => {
                    const linkedGoal = goals.find((g) => g.id === plan.goalId);

                    return (
                      <div
                        key={plan.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all ${
                          plan.completed
                            ? 'bg-teal-950/10 border-teal-500/20 opacity-60'
                            : 'bg-[#10101a]/80 border-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onToggleComplete(plan.id)}
                            className="mt-0.5 text-slate-400 hover:text-purple-400 cursor-pointer"
                          >
                            {plan.completed ? (
                              <CheckSquare className="w-5 h-5 text-teal-400" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-600" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4
                                className={`font-semibold text-base ${
                                  plan.completed ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {plan.topicName || plan.subjectName}
                              </h4>
                              {plan.priority === 'High' && <Badge variant="gold">High Priority</Badge>}
                              {plan.deadline && (
                                <Badge variant="danger" icon={<AlertCircle className="w-3 h-3" />}>
                                  Deadline: {plan.deadline}
                                </Badge>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-1">
                              <span>Subject: {plan.subjectName}</span>
                              <span>Time: {formatTime24To12(plan.startTime)}</span>
                              <span>Duration: {plan.duration}m</span>
                              <span className="text-amber-400 font-mono">+{plan.duration} Energy</span>
                            </div>

                            {linkedGoal && (
                              <div className="text-xs font-mono text-amber-300 flex items-center gap-1.5 mt-1">
                                <Target className="w-3.5 h-3.5 text-amber-400" />
                                <span>🎯 Linked Goal: {linkedGoal.title}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {!plan.completed ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onLaunchFocus(plan.subjectId, plan.topicId, plan.duration, plan.goalId, plan.habitId)}
                              icon={<Zap className="w-3.5 h-3.5 fill-purple-200" />}
                            >
                              Launch Focus
                            </Button>
                          ) : (
                            <Badge variant="teal">✓ Completed (+{plan.duration} XP)</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletePlan(plan.id)}
                            icon={<Trash2 className="w-4 h-4 text-red-400" />}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
