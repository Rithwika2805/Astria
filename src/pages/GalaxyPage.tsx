import React, { useState } from 'react';
import type { Subject, Goal, Habit, HabitCompletion, StudySession, StudyPlan, UserLevel, UserSettings } from '../types';
import { GalaxyCanvas } from '../components/galaxy/GalaxyCanvas';
import { PlanetDetailView } from '../components/galaxy/PlanetDetailView';
import { CreateSubjectModal } from '../components/galaxy/CreateSubjectModal';
import { CreateHabitModal } from '../components/habits/CreateHabitModal';
import { DailyMissionsCard } from '../components/planner/DailyMissionsCard';
import { RandomMissionModal } from '../components/planner/RandomMissionModal';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Globe, Plus, Compass, Repeat } from 'lucide-react';

export interface GalaxyPageProps {
  user: UserSettings;
  subjects: Subject[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  sessions: StudySession[];
  plans: StudyPlan[];
  userLevel: UserLevel;
  streakCount: number;
  selectedSubjectId: string | null;
  galaxyFilter: 'ALL' | 'ACTIVE' | 'HIGH_MOMENTUM' | 'DORMANT' | 'NEAR_DEADLINE';
  onFilterChange: (filter: 'ALL' | 'ACTIVE' | 'HIGH_MOMENTUM' | 'DORMANT' | 'NEAR_DEADLINE') => void;
  onSelectSubject: (id: string | null) => void;
  onCreateSubject: (
    name: string,
    description: string,
    color: string,
    category?: any,
    priority?: any,
    deadline?: string,
    initialGoal?: string
  ) => void;
  onUpdateSubject: (subjectId: string, data: Partial<Subject>) => void;
  onArchiveSubject: (subjectId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
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
  onAddUnit: (subjectId: string, name: string) => void;
  onAddTopic: (subjectId: string, unitId: string, name: string, est: number) => void;
  onUpdateTopicStatus: (topicId: string, status: any) => void;
  onTogglePlanComplete: (planId: string) => void;
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
  onOpenAddPlan: () => void;
}

export const GalaxyPage: React.FC<GalaxyPageProps> = ({
  user,
  subjects,
  goals,
  habits,
  habitCompletions,
  sessions,
  plans,
  userLevel,
  streakCount,
  selectedSubjectId,
  galaxyFilter,
  onFilterChange,
  onSelectSubject,
  onCreateSubject,
  onUpdateSubject,
  onArchiveSubject,
  onDeleteSubject,
  onCreateGoal,
  onToggleGoalComplete,
  onCreateHabit,
  onToggleHabitCompletion,
  onTogglePauseHabit,
  onDeleteHabit,
  onAddUnit,
  onAddTopic,
  onUpdateTopicStatus,
  onTogglePlanComplete,
  onLaunchFocus,
  onOpenAddPlan,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  if (selectedSubject) {
    return (
      <PlanetDetailView
        subject={selectedSubject}
        goals={goals}
        habits={habits}
        habitCompletions={habitCompletions}
        sessions={sessions}
        plans={plans}
        onBack={() => onSelectSubject(null)}
        onLaunchFocus={onLaunchFocus}
        onUpdateTopicStatus={onUpdateTopicStatus}
        onAddUnit={onAddUnit}
        onAddTopic={onAddTopic}
        onCreateGoal={onCreateGoal}
        onToggleGoalComplete={onToggleGoalComplete}
        onCreateHabit={onCreateHabit}
        onToggleHabitCompletion={onToggleHabitCompletion}
        onTogglePauseHabit={onTogglePauseHabit}
        onDeleteHabit={onDeleteHabit}
        onUpdateSubject={onUpdateSubject}
        onArchiveSubject={onArchiveSubject}
        onDeleteSubject={onDeleteSubject}
      />
    );
  }

  const xpPercentage = Math.round((userLevel.currentXp / userLevel.xpForNextLevel) * 100);

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Top Greeting Bar */}
      <div className="bg-[#080812]/90 border-b border-white/10 px-4 lg:px-8 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-purple-400 font-mono font-semibold">
              ACADEMIC UNIVERSE
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-wide">
              Good evening, {user.name}.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Your universe is expanding. Focus to discover stars, build planets, and perform habits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#10101c] border border-white/10 p-3 rounded-2xl flex items-center gap-3 min-w-[240px]">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center font-bold font-mono text-purple-300 text-sm">
                L{userLevel.level}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-white font-heading">{userLevel.title}</span>
                  <span className="text-[10px] font-mono text-purple-300">
                    {userLevel.currentXp}/{userLevel.xpForNextLevel} XP
                  </span>
                </div>
                <ProgressBar value={xpPercentage} size="sm" color="purple" />
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={() => setShowCreateHabitModal(true)} icon={<Repeat className="w-4 h-4" />}>
              + Create Habit
            </Button>

            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
              + Create Planet
            </Button>
          </div>
        </div>
      </div>

      {/* Main Galaxy Canvas */}
      <div className="relative flex-1">
        {subjects.filter((s) => !s.isArchived).length === 0 ? (
          <div className="h-[500px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Compass className="w-16 h-16 mb-4 text-purple-400/50 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-200 mb-2 font-heading">Your universe is quiet</h3>
            <p className="text-sm max-w-sm mb-6">
              Create your first subject planet world to begin charting stars, routines, and study blocks.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setShowCreateHabitModal(true)} icon={<Repeat className="w-4 h-4" />}>
                Create a routine habit
              </Button>
              <Button variant="primary" onClick={() => setShowCreateModal(true)} icon={<Globe className="w-4 h-4" />}>
                Create planet world
              </Button>
            </div>
          </div>
        ) : (
          <GalaxyCanvas
            subjects={subjects}
            goals={goals}
            sessions={sessions}
            streakCount={streakCount}
            activeFilter={galaxyFilter}
            onFilterChange={onFilterChange}
            onSelectSubject={onSelectSubject}
          />
        )}
      </div>

      {/* Bottom Mission Section */}
      <div className="bg-[#080812] border-t border-white/10 px-4 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <DailyMissionsCard
            plans={plans}
            goals={goals}
            habits={habits}
            habitCompletions={habitCompletions}
            subjects={subjects}
            sessions={sessions}
            onToggleCompletePlan={onTogglePlanComplete}
            onToggleHabitCompletion={onToggleHabitCompletion}
            onTogglePauseHabit={onTogglePauseHabit}
            onDeleteHabit={onDeleteHabit}
            onLaunchFocus={onLaunchFocus}
            onOpenAddPlan={onOpenAddPlan}
            onOpenCreateHabit={() => setShowCreateHabitModal(true)}
            onOpenRandomMission={() => setShowRandomModal(true)}
          />
        </div>
      </div>

      {/* Create Subject Modal */}
      <CreateSubjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={onCreateSubject}
      />

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={showCreateHabitModal}
        subjects={subjects}
        goals={goals}
        onClose={() => setShowCreateHabitModal(false)}
        onCreateHabit={onCreateHabit}
      />

      {/* Random Mission Modal */}
      <RandomMissionModal
        isOpen={showRandomModal}
        subjects={subjects}
        onClose={() => setShowRandomModal(false)}
        onAcceptMission={onLaunchFocus}
      />
    </div>
  );
};
