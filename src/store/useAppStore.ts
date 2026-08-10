import { useState, useCallback } from 'react';
import type {
  UserProgressState,
  Subject,
  Goal,
  GoalType,
  Habit,
  HabitCompletion,
  HabitType,
  HabitFrequency,
  StudySession,
  StudyPlan,
  Achievement,
  UserSettings,
  TopicStatus,
  PlanPriority,
  Topic,
  SubjectCategory,
} from '../types';
import { StorageService } from '../services/storage';
import { ProgressionService } from '../services/progression';
import { HabitService } from '../services/habitService';
import { AudioService } from '../services/audio';

export type ActiveTab = 'galaxy' | 'planner' | 'focus' | 'progress' | 'achievements' | 'settings';

export function useAppStore() {
  const [state, setState] = useState<UserProgressState>(() => StorageService.loadState());
  const [activeTab, setActiveTabState] = useState<ActiveTab>('galaxy');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Focus Timer overlay state
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);
  const [focusConfig, setFocusConfig] = useState<{
    subjectId: string;
    topicId?: string;
    goalId?: string;
    habitId?: string;
    duration: number; // in minutes
  } | null>(null);

  // Global Search state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Galaxy Filter state
  const [galaxyFilter, setGalaxyFilter] = useState<'ALL' | 'ACTIVE' | 'HIGH_MOMENTUM' | 'DORMANT' | 'NEAR_DEADLINE'>('ALL');

  // Modals / Overlays triggers
  const [lastCompletedSession, setLastCompletedSession] = useState<StudySession | null>(null);
  const [supernovaMilestone, setSupernovaMilestone] = useState<{ title: string; subtitle: string } | null>(null);
  const [unlockedAchievementAlert, setUnlockedAchievementAlert] = useState<Achievement | null>(null);

  // Sync state changes to storage
  const updateAndSaveState = useCallback((updater: (prev: UserProgressState) => UserProgressState) => {
    setState((prev) => {
      const next = updater(prev);
      StorageService.saveState(next);
      return next;
    });
  }, []);

  const setActiveTab = (tab: ActiveTab) => {
    AudioService.playClick(state.user.soundEnabled);
    setActiveTabState(tab);
  };

  const selectSubject = (id: string | null) => {
    AudioService.playClick(state.user.soundEnabled);
    setSelectedSubjectId(id);
  };

  const selectTopic = (id: string | null) => {
    AudioService.playClick(state.user.soundEnabled);
    setSelectedTopicId(id);
  };

  // Selectors
  const getGoalsForSubject = (subjectId: string): Goal[] => {
    return state.goals.filter((g) => g.subjectId === subjectId);
  };

  const getHabitsForSubject = (subjectId: string): Habit[] => {
    return state.habits.filter((h) => h.subjectId === subjectId && !h.isArchived);
  };

  const getHabitsForGoal = (goalId: string): Habit[] => {
    return state.habits.filter((h) => h.goalId === goalId && !h.isArchived);
  };

  const getHabitsDueToday = (): Habit[] => {
    const todayStr = new Date().toISOString().split('T')[0];
    return state.habits.filter((h) => HabitService.isHabitDueOnDate(h, todayStr));
  };

  // Create Subject Planet
  const createSubject = (
    name: string,
    description: string,
    color: string,
    category: SubjectCategory = 'Academic',
    priority: PlanPriority = 'High',
    deadline?: string,
    initialGoalTitle?: string
  ) => {
    const subjId = `subj-${Date.now()}`;
    const newSubject: Subject = {
      id: subjId,
      name,
      description,
      color,
      secondaryColor: color,
      glowColor: `${color}66`,
      icon: 'Globe',
      category,
      priority,
      deadline,
      createdAt: new Date().toISOString().split('T')[0],
      orbitRadius: 160 + state.subjects.length * 80,
      orbitAngle: Math.floor(Math.random() * 360),
      size: 40,
      units: [],
    };

    let newGoals = state.goals;
    if (initialGoalTitle && initialGoalTitle.trim()) {
      const firstGoal: Goal = {
        id: `goal-${Date.now()}`,
        subjectId: subjId,
        title: initialGoalTitle.trim(),
        type: 'boolean',
        deadline,
        priority,
        linkedTopicIds: [],
        completed: false,
      };
      newGoals = [...state.goals, firstGoal];
    }

    updateAndSaveState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
      goals: newGoals,
    }));

    setSupernovaMilestone({
      title: 'NEW WORLD FORMED ✦',
      subtitle: `Planet ${name} has emerged in your personal universe.`,
    });
  };

  const updateSubject = (
    subjectId: string,
    data: Partial<Omit<Subject, 'id' | 'units'>>
  ) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subjectId ? { ...s, ...data } : s)),
    }));
  };

  const archiveSubject = (subjectId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subjectId ? { ...s, isArchived: true } : s)),
    }));
    if (selectedSubjectId === subjectId) setSelectedSubjectId(null);
  };

  const restoreSubject = (subjectId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subjectId ? { ...s, isArchived: false } : s)),
    }));
  };

  const deleteSubject = (subjectId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      goals: prev.goals.filter((g) => g.subjectId !== subjectId),
      habits: prev.habits.filter((h) => h.subjectId !== subjectId),
      plans: prev.plans.filter((p) => p.subjectId !== subjectId),
    }));
    if (selectedSubjectId === subjectId) setSelectedSubjectId(null);
  };

  // Goal Actions
  const createGoal = (
    subjectId: string,
    title: string,
    type: GoalType,
    targetValue?: number,
    unitLabel?: string,
    deadline?: string,
    priority: PlanPriority = 'High',
    linkedTopicIds: string[] = []
  ) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      subjectId,
      title,
      type,
      targetValue,
      unitLabel,
      deadline,
      priority,
      linkedTopicIds,
      completed: false,
    };

    updateAndSaveState((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  const toggleGoalComplete = (goalId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              completed: !g.completed,
              completedAt: !g.completed ? new Date().toISOString() : undefined,
            }
          : g
      ),
    }));
  };

  const deleteGoal = (goalId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== goalId),
      habits: prev.habits.map((h) => (h.goalId === goalId ? { ...h, goalId: undefined } : h)),
    }));
  };

  // HABIT ACTIONS
  const createHabit = (
    title: string,
    type: HabitType,
    frequency: HabitFrequency,
    subjectId?: string,
    goalId?: string,
    description?: string,
    targetValue?: number,
    daysOfWeek?: number[],
    preferredTime?: string,
    startDate?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      title: title.trim(),
      type,
      frequency,
      subjectId: subjectId || undefined,
      goalId: goalId || undefined,
      description: description?.trim() || undefined,
      targetValue: targetValue || (type === 'time_based' ? 45 : 1),
      durationMinutes: type === 'time_based' ? targetValue || 45 : undefined,
      daysOfWeek: daysOfWeek || [],
      preferredTime: preferredTime || undefined,
      startDate: startDate || todayStr,
      active: true,
      createdAt: new Date().toISOString(),
    };

    updateAndSaveState((prev) => ({
      ...prev,
      habits: [...prev.habits, newHabit],
    }));
  };

  const updateHabit = (habitId: string, data: Partial<Habit>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === habitId ? { ...h, ...data } : h)),
    }));
  };

  const toggleHabitPause = (habitId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId ? { ...h, isPaused: !h.isPaused } : h
      ),
    }));
  };

  const archiveHabit = (habitId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) =>
        h.id === habitId ? { ...h, isArchived: true } : h
      ),
    }));
  };

  const deleteHabit = (habitId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
      habitCompletions: prev.habitCompletions.filter((c) => c.habitId !== habitId),
    }));
  };

  const toggleHabitCompletion = (habitId: string, dateStr?: string) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    updateAndSaveState((prev) => {
      const existing = prev.habitCompletions.find(
        (c) => c.habitId === habitId && c.date === targetDate
      );

      let nextCompletions: HabitCompletion[];
      if (existing) {
        // Toggle OFF (uncomplete)
        nextCompletions = prev.habitCompletions.filter((c) => c.id !== existing.id);
      } else {
        // Toggle ON (complete)
        const targetHabit = prev.habits.find((h) => h.id === habitId);
        const newCompletion: HabitCompletion = {
          id: `hcomp-${Date.now()}`,
          habitId,
          date: targetDate,
          completedAt: new Date().toISOString(),
          durationMinutes: targetHabit?.durationMinutes || (targetHabit?.type === 'time_based' ? targetHabit.targetValue : undefined),
          count: targetHabit?.type === 'count_based' ? targetHabit.targetValue : 1,
        };
        nextCompletions = [...prev.habitCompletions, newCompletion];
        AudioService.playCompletionChime(prev.user.soundEnabled);
      }

      // Check linked Goal progress if applicable
      const targetHabit = prev.habits.find((h) => h.id === habitId);
      let nextGoals = prev.goals;
      if (targetHabit?.goalId) {
        nextGoals = prev.goals.map((g) => {
          if (g.id !== targetHabit.goalId) return g;
          if (g.type === 'quantitative' && g.currentValue !== undefined) {
            const addVal = !existing ? (targetHabit.targetValue || 1) : -(targetHabit.targetValue || 1);
            const nextVal = Math.max(0, g.currentValue + addVal);
            return {
              ...g,
              currentValue: nextVal,
              completed: nextVal >= (g.targetValue || 1),
            };
          }
          return g;
        });
      }

      return {
        ...prev,
        habitCompletions: nextCompletions,
        goals: nextGoals,
      };
    });
  };

  // Add Unit
  const createUnit = (subjectId: string, name: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        const newUnit = {
          id: `unit-${Date.now()}`,
          subjectId,
          name,
          order: s.units.length + 1,
          topics: [],
        };
        return { ...s, units: [...s.units, newUnit] };
      }),
    }));
  };

  // Add Topic
  const createTopic = (subjectId: string, unitId: string, name: string, estimatedMinutes = 45, goalIds: string[] = []) => {
    updateAndSaveState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map((u) => {
            if (u.id !== unitId) return u;
            const newTopic: Topic = {
              id: `top-${Date.now()}`,
              unitId,
              subjectId,
              name,
              status: 'NOT_STARTED',
              estimatedMinutes,
              studiedMinutes: 0,
              goalIds,
            };
            return { ...u, topics: [...u.topics, newTopic] };
          }),
        };
      }),
    }));
  };

  // Update Topic Status / Minutes
  const updateTopicStatus = (topicId: string, status: TopicStatus, addMinutes = 0) => {
    updateAndSaveState((prev) => {
      const nextSubjects: Subject[] = prev.subjects.map((s) => ({
        ...s,
        units: s.units.map((u) => ({
          ...u,
          topics: u.topics.map((t): Topic => {
            if (t.id !== topicId) return t;
            return {
              ...t,
              status,
              studiedMinutes: t.studiedMinutes + addMinutes,
              completedAt: status === 'COMPLETED' || status === 'MASTERED' ? t.completedAt || new Date().toISOString() : t.completedAt,
            };
          }),
        })),
      }));

      return {
        ...prev,
        subjects: nextSubjects,
      };
    });
  };

  // Add Study Plan Mission
  const createPlan = (
    subjectId: string,
    topicId: string | undefined,
    goalId: string | undefined,
    date: string,
    startTime: string,
    duration: number,
    priority: PlanPriority,
    habitId?: string
  ) => {
    const subj = state.subjects.find((s) => s.id === subjectId);
    let topicName = undefined;
    if (subj && topicId) {
      subj.units.forEach((u) => {
        const top = u.topics.find((t) => t.id === topicId);
        if (top) topicName = top.name;
      });
    }

    const newPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      subjectId,
      topicId,
      goalId,
      habitId,
      subjectName: subj?.name || 'General Study',
      topicName,
      date,
      startTime,
      duration,
      priority,
      completed: false,
    };

    updateAndSaveState((prev) => ({
      ...prev,
      plans: [...prev.plans, newPlan],
    }));
  };

  const togglePlanComplete = (planId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, completed: !p.completed, completedAt: !p.completed ? new Date().toISOString() : undefined } : p)),
    }));
  };

  const deletePlan = (planId: string) => {
    updateAndSaveState((prev) => ({
      ...prev,
      plans: prev.plans.filter((p) => p.id !== planId),
    }));
  };

  // Focus Timer Actions
  const launchFocusSession = (subjectId: string, topicId?: string, duration: number = 45, goalId?: string, habitId?: string) => {
    setFocusConfig({ subjectId, topicId, duration, goalId, habitId });
    setIsFocusActive(true);
    AudioService.startAmbientDrone(state.user.soundEnabled);
  };

  const endFocusSession = (actualDurationMinutes: number, markTopicCompleted = false) => {
    AudioService.stopAmbientDrone();
    setIsFocusActive(false);

    if (!focusConfig || actualDurationMinutes <= 0) return;

    const subj = state.subjects.find((s) => s.id === focusConfig.subjectId);
    let topicName: string | undefined;

    if (subj && focusConfig.topicId) {
      subj.units.forEach((u) => {
        const top = u.topics.find((t) => t.id === focusConfig.topicId);
        if (top) topicName = top.name;
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const energyEarned = actualDurationMinutes;

    const newSession: StudySession = {
      id: `sess-${Date.now()}`,
      subjectId: focusConfig.subjectId,
      topicId: focusConfig.topicId,
      goalId: focusConfig.goalId,
      habitId: focusConfig.habitId,
      subjectName: subj?.name || 'Study Session',
      topicName,
      startTime: new Date(Date.now() - actualDurationMinutes * 60000).toISOString(),
      endTime: new Date().toISOString(),
      duration: actualDurationMinutes,
      plannedDuration: focusConfig.duration,
      energyEarned,
    };

    updateAndSaveState((prev) => {
      const nextSessions = [newSession, ...prev.sessions];

      // Auto-record HabitCompletion if launched from a Habit
      let nextHabitCompletions = prev.habitCompletions;
      if (focusConfig.habitId) {
        const existingComp = prev.habitCompletions.find(
          (c) => c.habitId === focusConfig.habitId && c.date === todayStr
        );
        if (!existingComp) {
          const newComp: HabitCompletion = {
            id: `hcomp-${Date.now()}`,
            habitId: focusConfig.habitId,
            date: todayStr,
            completedAt: new Date().toISOString(),
            durationMinutes: actualDurationMinutes,
            linkedSessionId: newSession.id,
          };
          nextHabitCompletions = [...prev.habitCompletions, newComp];
        }
      }

      const historySet = new Set(prev.streak.history);
      const isNewDay = !historySet.has(todayStr);
      historySet.add(todayStr);

      let currentStreak = prev.streak.current;
      if (isNewDay) {
        if (prev.streak.lastStudiedDate) {
          const lastDate = new Date(prev.streak.lastStudiedDate);
          const today = new Date(todayStr);
          const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            currentStreak += 1;
          } else if (diffDays > 1) {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
      }

      const maxStreak = Math.max(currentStreak, prev.streak.max);

      const nextSubjects: Subject[] = prev.subjects.map((s) => {
        if (s.id !== focusConfig.subjectId) return s;
        return {
          ...s,
          units: s.units.map((u) => ({
            ...u,
            topics: u.topics.map((t): Topic => {
              if (t.id !== focusConfig.topicId) return t;
              const newStudied = t.studiedMinutes + actualDurationMinutes;
              const isComp = markTopicCompleted || newStudied >= t.estimatedMinutes;
              const newStatus: TopicStatus = isComp ? 'COMPLETED' : 'IN_PROGRESS';
              return {
                ...t,
                studiedMinutes: newStudied,
                status: newStatus,
                completedAt: isComp ? t.completedAt || new Date().toISOString() : t.completedAt,
              };
            }),
          })),
        };
      });

      const totalEnergy = nextSessions.reduce((a, s) => a + s.duration, 0);
      const { updatedAchievements, newlyUnlocked } = ProgressionService.evaluateAchievements(
        prev.achievements,
        nextSubjects,
        nextSessions,
        currentStreak,
        totalEnergy
      );

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievementAlert(newlyUnlocked[0]);
        AudioService.playLevelUpFanfare(prev.user.soundEnabled);
      }

      return {
        ...prev,
        subjects: nextSubjects,
        sessions: nextSessions,
        habitCompletions: nextHabitCompletions,
        streak: {
          current: currentStreak,
          max: maxStreak,
          lastStudiedDate: todayStr,
          history: Array.from(historySet),
        },
        achievements: updatedAchievements,
      };
    });

    AudioService.playCompletionChime(state.user.soundEnabled);
    setLastCompletedSession(newSession);
  };

  const closeSessionModal = () => setLastCompletedSession(null);
  const closeSupernovaModal = () => setSupernovaMilestone(null);
  const closeAchievementModal = () => setUnlockedAchievementAlert(null);

  const updateSettings = (userPartial: Partial<UserSettings>) => {
    updateAndSaveState((prev) => ({
      ...prev,
      user: { ...prev.user, ...userPartial },
    }));
  };

  const resetData = () => {
    const res = StorageService.resetState();
    setState(res);
  };

  const importBackup = (jsonStr: string) => {
    const res = StorageService.importStateJson(jsonStr);
    if (res) setState(res);
    return !!res;
  };

  const universeStats = ProgressionService.calculateUniverseStats(state.subjects, state.sessions);
  const userLevel = ProgressionService.calculateUserLevel(universeStats.totalStudiedMinutes);

  return {
    ...state,
    activeTab,
    selectedSubjectId,
    selectedTopicId,
    isFocusActive,
    focusConfig,
    isSearchOpen,
    galaxyFilter,
    lastCompletedSession,
    supernovaMilestone,
    unlockedAchievementAlert,
    universeStats,
    userLevel,

    // Selectors
    getGoalsForSubject,
    getHabitsForSubject,
    getHabitsForGoal,
    getHabitsDueToday,

    // Actions
    setActiveTab,
    selectSubject,
    selectTopic,
    setGalaxyFilter,
    openSearch: () => setIsSearchOpen(true),
    closeSearch: () => setIsSearchOpen(false),
    createSubject,
    updateSubject,
    archiveSubject,
    restoreSubject,
    deleteSubject,
    createGoal,
    toggleGoalComplete,
    deleteGoal,
    createHabit,
    updateHabit,
    toggleHabitPause,
    archiveHabit,
    deleteHabit,
    toggleHabitCompletion,
    createUnit,
    createTopic,
    updateTopicStatus,
    createPlan,
    togglePlanComplete,
    deletePlan,
    launchFocusSession,
    endFocusSession,
    closeSessionModal,
    closeSupernovaModal,
    closeAchievementModal,
    updateSettings,
    resetData,
    importBackup,
  };
}
