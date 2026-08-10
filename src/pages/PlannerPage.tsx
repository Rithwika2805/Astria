import React, { useState } from 'react';
import type { StudyPlan, Subject, Goal, Habit, HabitCompletion, PlanPriority } from '../types';
import { PlannerCalendar } from '../components/planner/PlannerCalendar';
import { AddPlanModal } from '../components/planner/AddPlanModal';
import { CreateHabitModal } from '../components/habits/CreateHabitModal';

export interface PlannerPageProps {
  plans: StudyPlan[];
  subjects: Subject[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  sessions: any[];
  onToggleComplete: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
  onCreatePlan: (
    subjectId: string,
    topicId: string | undefined,
    goalId: string | undefined,
    date: string,
    startTime: string,
    duration: number,
    priority: PlanPriority
  ) => void;
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
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({
  plans,
  subjects,
  goals,
  habits,
  habitCompletions,
  sessions,
  onToggleComplete,
  onDeletePlan,
  onCreatePlan,
  onCreateHabit,
  onLaunchFocus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);

  return (
    <div>
      <PlannerCalendar
        plans={plans}
        subjects={subjects}
        goals={goals}
        habits={habits}
        habitCompletions={habitCompletions}
        sessions={sessions}
        onToggleComplete={onToggleComplete}
        onDeletePlan={onDeletePlan}
        onLaunchFocus={onLaunchFocus}
        onOpenAddPlanModal={() => setShowAddModal(true)}
        onOpenCreateHabitModal={() => setShowCreateHabitModal(true)}
      />

      <AddPlanModal
        isOpen={showAddModal}
        subjects={subjects}
        goals={goals}
        onClose={() => setShowAddModal(false)}
        onCreatePlan={onCreatePlan}
      />

      <CreateHabitModal
        isOpen={showCreateHabitModal}
        subjects={subjects}
        goals={goals}
        onClose={() => setShowCreateHabitModal(false)}
        onCreateHabit={onCreateHabit}
      />
    </div>
  );
};
