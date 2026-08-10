import React, { useState } from 'react';
import type { Subject, Goal, Habit, HabitCompletion, Topic, StudySession, StudyPlan } from '../../types';
import { ProgressionService } from '../../services/progression';
import { HabitService } from '../../services/habitService';
import { formatMinutes } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { TopicDetailModal } from './TopicDetailModal';
import { AddGoalModal } from './AddGoalModal';
import { EditSubjectModal } from './EditSubjectModal';
import { CreateHabitModal } from '../habits/CreateHabitModal';
import { HabitCard } from '../habits/HabitCard';
import { HabitDetailModal } from '../habits/HabitDetailModal';
import {
  ArrowLeft,
  Zap,
  Sparkles,
  Clock,
  CheckCircle2,
  Orbit,
  Star,
  Plus,
  Target,
  Settings,
  Flame,
  AlertTriangle,
  Calendar,
  Repeat,
} from 'lucide-react';

export interface PlanetDetailViewProps {
  subject: Subject;
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  sessions: StudySession[];
  plans: StudyPlan[];
  onBack: () => void;
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
  onUpdateTopicStatus: (topicId: string, status: any) => void;
  onAddUnit: (subjectId: string, name: string) => void;
  onAddTopic: (subjectId: string, unitId: string, name: string, estimatedMins: number) => void;
  onCreateGoal: (
    subjectId: string,
    title: string,
    type: any,
    targetValue?: number,
    unitLabel?: string,
    deadline?: string,
    priority?: any,
    linkedTopicIds?: string[]
  ) => void;
  onToggleGoalComplete: (goalId: string) => void;
  onCreateHabit: (
    title: string,
    type: any,
    frequency: any,
    subjectId?: string,
    goalId?: string,
    description?: string,
    targetValue?: number,
    daysOfWeek?: number[],
    preferredTime?: string,
    startDate?: string
  ) => void;
  onToggleHabitCompletion: (habitId: string, dateStr?: string) => void;
  onTogglePauseHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onUpdateSubject: (subjectId: string, data: Partial<Subject>) => void;
  onArchiveSubject: (subjectId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const PlanetDetailView: React.FC<PlanetDetailViewProps> = ({
  subject,
  goals,
  habits,
  habitCompletions,
  sessions,
  plans,
  onBack,
  onLaunchFocus,
  onUpdateTopicStatus,
  onAddUnit,
  onAddTopic,
  onCreateGoal,
  onToggleGoalComplete,
  onCreateHabit,
  onToggleHabitCompletion,
  onTogglePauseHabit,
  onDeleteHabit,
  onUpdateSubject,
  onArchiveSubject,
  onDeleteSubject,
}) => {
  const stats = ProgressionService.calculateSubjectStats(subject, sessions, goals);
  const subjectGoals = goals.filter((g) => g.subjectId === subject.id);
  const subjectHabits = habits.filter((h) => h.subjectId === subject.id && !h.isArchived);
  const subjectPlans = plans.filter((p) => p.subjectId === subject.id && !p.completed);
  const subjectSessions = sessions.filter((s) => s.subjectId === subject.id).slice(0, 5);

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [selectedDetailHabit, setSelectedDetailHabit] = useState<Habit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // New Unit / Topic inline form state
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [activeUnitIdForTopic, setActiveUnitIdForTopic] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicEst, setNewTopicEst] = useState(45);

  const handleAddUnitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    onAddUnit(subject.id, newUnitName.trim());
    setNewUnitName('');
    setShowAddUnitForm(false);
  };

  const handleAddTopicSubmit = (unitId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    onAddTopic(subject.id, unitId, newTopicName.trim(), newTopicEst);
    setNewTopicName('');
    setActiveUnitIdForTopic(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 text-slate-100 animate-fadeIn space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Galaxy
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowEditModal(true)} icon={<Settings className="w-4 h-4" />}>
            Manage Planet
          </Button>
          <Button
            variant="primary"
            onClick={() => onLaunchFocus(subject.id)}
            icon={<Zap className="w-4 h-4 text-purple-200 fill-purple-200" />}
          >
            Enter Subject Focus
          </Button>
        </div>
      </div>

      {/* Spacecraft Navigation Console Header */}
      <div className="relative bg-gradient-to-r from-[#0e0e1a] via-[#121226] to-[#0a0a14] border border-purple-500/30 rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: subject.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: subject.color }} />
              <span className="text-xs uppercase tracking-widest text-purple-400 font-mono font-semibold">
                NAV-CONSOLE // {subject.category || 'ACADEMIC'} WORLD
              </span>
              {stats.momentum === 'HIGH' && (
                <Badge variant="gold" icon={<Flame className="w-3 h-3 fill-amber-400" />}>
                  High Momentum
                </Badge>
              )}
              {stats.momentum === 'NEEDS_ATTENTION' && (
                <Badge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>
                  Needs Attention
                </Badge>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold font-heading tracking-wide text-white mb-2">
              🪐 {subject.name}
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed mb-4">{subject.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>{formatMinutes(stats.totalStudiedMinutes)} studied</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>
                  {stats.masteredTopics} / {stats.totalTopics} topics mastered
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Repeat className="w-4 h-4 text-purple-400" />
                <span>{subjectHabits.length} Active Routines</span>
              </div>
            </div>
          </div>

          {/* Progress Ring Console Metric */}
          <div className="bg-[#141422]/90 border border-white/10 p-5 rounded-2xl flex flex-col items-center justify-center min-w-[180px]">
            <div className="relative w-24 h-24 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke={subject.color}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * stats.percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xl font-bold font-mono text-white">{stats.percentage}%</span>
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono">World Explored</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <ProgressBar value={stats.percentage} customColorHex={subject.color} color="custom" showLabel labelPosition="right" />
        </div>
      </div>

      {/* Planet Routines (Habits) Section */}
      <div className="bg-[#10101a]/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold font-heading text-white">Active Planet Routines</h2>
            <Badge variant="purple" className="font-mono">
              {subjectHabits.length}
            </Badge>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setShowCreateHabitModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            + Create Habit
          </Button>
        </div>

        {subjectHabits.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-[#0c0c16] rounded-xl border border-white/5">
            <p>No repeated habits linked to {subject.name}.</p>
            <button
              onClick={() => setShowCreateHabitModal(true)}
              className="text-purple-400 hover:text-purple-300 font-medium underline mt-1 cursor-pointer"
            >
              Build a recurring study habit for this world
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {subjectHabits.map((habit) => (
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
      </div>

      {/* Active Planet Goals Objectives Section */}
      <div className="bg-[#10101a]/80 border border-amber-500/20 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-heading text-white">Active Planet Goals</h2>
            <Badge variant="gold" className="font-mono">
              {subjectGoals.filter((g) => g.completed).length} / {subjectGoals.length}
            </Badge>
          </div>

          <Button variant="secondary" size="sm" onClick={() => setShowAddGoalModal(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            + Add Goal
          </Button>
        </div>

        {subjectGoals.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-[#0c0c16] rounded-xl border border-white/5">
            <p>No active goals defined for {subject.name}.</p>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="text-purple-400 hover:text-purple-300 font-medium underline mt-1 cursor-pointer"
            >
              Create your first goal objective
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectGoals.map((goal) => {
              const goalCalc = ProgressionService.calculateGoalProgress(goal, sessions, [subject]);

              return (
                <div
                  key={goal.id}
                  className={`p-4 rounded-xl border transition-all ${
                    goalCalc.isCompleted
                      ? 'bg-teal-950/20 border-teal-500/30 opacity-70'
                      : 'bg-[#141424] border-white/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => onToggleGoalComplete(goal.id)}
                        className="mt-0.5 text-slate-400 hover:text-amber-400 cursor-pointer"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${goalCalc.isCompleted ? 'text-teal-400 fill-teal-950' : 'text-slate-600'}`}
                        />
                      </button>
                      <div>
                        <h4 className={`font-semibold text-sm ${goalCalc.isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                          {goal.title}
                        </h4>
                        {goal.description && <p className="text-xs text-slate-400 mt-0.5">{goal.description}</p>}
                      </div>
                    </div>

                    <Badge variant={goal.priority === 'High' ? 'gold' : 'purple'}>{goal.priority}</Badge>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">{goalCalc.displayText}</span>
                      <span className="text-amber-300 font-bold">{goalCalc.percentage}%</span>
                    </div>
                    <ProgressBar value={goalCalc.percentage} color="gold" size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Units & Constellations Map */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-heading text-white tracking-wide">Constellation Map</h2>
          <p className="text-xs text-slate-400">Select a topic star to inspect status or launch focus mode.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowAddUnitForm(true)} icon={<Plus className="w-4 h-4" />}>
          Add Unit Moon
        </Button>
      </div>

      {/* Add Unit Inline Form */}
      {showAddUnitForm && (
        <form onSubmit={handleAddUnitSubmit} className="bg-[#10101c] border border-purple-500/40 p-4 rounded-2xl flex gap-3">
          <input
            type="text"
            placeholder="Unit / Module Name (e.g. Neural Networks)"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            className="flex-1 bg-[#181828] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <Button type="submit" variant="primary" size="sm">
            Save Unit
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddUnitForm(false)}>
            Cancel
          </Button>
        </form>
      )}

      {/* Units Container */}
      <div className="space-y-8">
        {subject.units.map((unit) => {
          const unitConstellation = ProgressionService.getUnitConstellationStatus(unit);

          return (
            <div key={unit.id} className="bg-[#10101a]/70 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Orbit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white font-heading">{unit.name}</h3>
                    <span className="text-xs text-slate-400">
                      {unit.topics.length} topic stars ({unitConstellation.completedTopics} finished)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unitConstellation.isDiscovered && (
                    <Badge variant="gold" icon={<Sparkles className="w-3 h-3" />}>
                      Constellation Mastered ✨
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveUnitIdForTopic(unit.id)}
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Star
                  </Button>
                </div>
              </div>

              {/* Add Topic Inline Form */}
              {activeUnitIdForTopic === unit.id && (
                <form
                  onSubmit={(e) => handleAddTopicSubmit(unit.id, e)}
                  className="bg-[#141424] border border-purple-500/40 p-4 rounded-xl mb-6 flex flex-wrap items-center gap-3"
                >
                  <input
                    type="text"
                    placeholder="Topic Name (e.g. Backpropagation)"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="flex-1 min-w-[200px] bg-[#1a1a2e] border border-white/15 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <span>Est. Mins:</span>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      value={newTopicEst}
                      onChange={(e) => setNewTopicEst(parseInt(e.target.value, 10) || 45)}
                      className="w-16 bg-[#1a1a2e] border border-white/15 rounded-xl px-2 py-1.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="sm">
                    Add Topic
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setActiveUnitIdForTopic(null)}>
                    Cancel
                  </Button>
                </form>
              )}

              {/* Topic Stars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.topics.map((topic) => {
                  const isMastered = topic.status === 'MASTERED';
                  const isCompleted = topic.status === 'COMPLETED';
                  const isInProgress = topic.status === 'IN_PROGRESS';

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-3 ${
                        isMastered
                          ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400 hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.3)]'
                          : isCompleted
                          ? 'bg-teal-950/20 border-teal-500/40 hover:border-teal-400 hover:shadow-[0_0_20px_-3px_rgba(20,184,166,0.3)]'
                          : isInProgress
                          ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400 hover:shadow-[0_0_20px_-3px_rgba(168,85,247,0.3)]'
                          : 'bg-[#141420]/60 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="mt-0.5 relative shrink-0">
                        {isMastered ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} />
                          </div>
                        ) : isCompleted ? (
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300">
                            <Star className="w-4 h-4 fill-teal-300" />
                          </div>
                        ) : isInProgress ? (
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 animate-pulse">
                            <Star className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-600">
                            <Star className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-white truncate mb-1">{topic.name}</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>{topic.studiedMinutes} / {topic.estimatedMinutes}m</span>
                          {isMastered ? (
                            <Badge variant="gold">Mastered</Badge>
                          ) : isCompleted ? (
                            <Badge variant="teal">Completed</Badge>
                          ) : isInProgress ? (
                            <Badge variant="purple">In Progress</Badge>
                          ) : (
                            <Badge variant="gray">Not Started</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Missions & Recent Activity Split Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#10101a]/80 border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm font-heading">Upcoming Missions</h3>
          </div>
          {subjectPlans.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No upcoming missions scheduled for this planet.</p>
          ) : (
            <div className="space-y-2">
              {subjectPlans.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-[#141424] border border-white/10 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">{p.topicName || p.subjectName}</span>
                    <span className="text-slate-400">{p.date} • {p.duration}m</span>
                  </div>
                  <Button variant="primary" size="sm" onClick={() => onLaunchFocus(p.subjectId, p.topicId, p.duration, p.goalId, p.habitId)}>
                    Launch
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#10101a]/80 border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-teal-400" />
            <h3 className="font-semibold text-white text-sm font-heading">Recent Focus Activity</h3>
          </div>
          {subjectSessions.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No focus sessions recorded yet for this planet.</p>
          ) : (
            <div className="space-y-2">
              {subjectSessions.map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-[#141424] border border-white/10 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-white block">{s.topicName || s.subjectName}</span>
                    <span className="text-slate-400">{new Date(s.startTime).toLocaleDateString()}</span>
                  </div>
                  <span className="font-mono text-amber-400">+{s.energyEarned} Energy</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <TopicDetailModal
          isOpen={!!selectedTopic}
          topic={selectedTopic}
          subjectName={subject.name}
          onClose={() => setSelectedTopic(null)}
          onStartFocus={(tId) => {
            setSelectedTopic(null);
            onLaunchFocus(subject.id, tId);
          }}
          onUpdateStatus={(tId, status) => {
            onUpdateTopicStatus(tId, status);
            setSelectedTopic((prev) => (prev ? { ...prev, status } : null));
          }}
        />
      )}

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={showAddGoalModal}
        subjects={[subject]}
        initialSubjectId={subject.id}
        onClose={() => setShowAddGoalModal(false)}
        onCreateGoal={onCreateGoal}
      />

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showCreateHabitModal}
        subjects={[subject]}
        goals={goals}
        initialSubjectId={subject.id}
        onClose={() => setShowCreateHabitModal(false)}
        onCreateHabit={onCreateHabit}
      />

      {/* Habit Detail Modal */}
      {selectedDetailHabit && (
        <HabitDetailModal
          isOpen={!!selectedDetailHabit}
          habit={selectedDetailHabit}
          completions={habitCompletions}
          subjects={[subject]}
          goals={goals}
          sessions={sessions}
          onClose={() => setSelectedDetailHabit(null)}
          onTogglePause={onTogglePauseHabit}
          onDeleteHabit={onDeleteHabit}
        />
      )}

      {/* Edit Subject Modal */}
      <EditSubjectModal
        isOpen={showEditModal}
        subject={subject}
        onClose={() => setShowEditModal(false)}
        onUpdateSubject={onUpdateSubject}
        onArchiveSubject={onArchiveSubject}
        onDeleteSubject={onDeleteSubject}
      />
    </div>
  );
};
