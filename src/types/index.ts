export type GoalType = 'boolean' | 'quantitative' | 'study_time' | 'topic_count';

export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export type PlanPriority = 'High' | 'Medium' | 'Low';

export type SubjectCategory =
  | 'Academic'
  | 'Competitive Exam'
  | 'Programming'
  | 'Project'
  | 'Personal Learning'
  | 'Other';

export type SubjectMomentum =
  | 'HIGH'
  | 'GROWING'
  | 'DORMANT'
  | 'NEEDS_ATTENTION';

export type AchievementRarity =
  | 'COMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY';

export type ThemeOption = 'cosmic-dark' | 'midnight-blue' | 'nebula-purple';

// Top-Level Goal entity
export interface Goal {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  type: GoalType;
  targetValue?: number;
  currentValue?: number;
  unitLabel?: string;
  deadline?: string;
  priority: PlanPriority;
  linkedTopicIds: string[];
  completed: boolean;
  completedAt?: string;
}

// Topic entity
export interface Topic {
  id: string;
  unitId: string;
  subjectId: string;
  name: string;
  status: TopicStatus;
  estimatedMinutes: number;
  studiedMinutes: number;
  completedAt?: string;
  notes?: string;
  goalIds?: string[];
}

// Unit Module entity
export interface Unit {
  id: string;
  subjectId: string;
  name: string;
  order: number;
  topics: Topic[];
}

// Subject Planet entity
export interface Subject {
  id: string;
  name: string;
  description: string;
  color: string;
  secondaryColor?: string;
  glowColor?: string;
  icon: string;
  category?: SubjectCategory;
  priority?: PlanPriority;
  deadline?: string;
  createdAt: string;
  orbitRadius?: number;
  orbitAngle?: number;
  size?: number;
  units: Unit[];
  isArchived?: boolean;
}

// HABITS / REPEATABLE TASKS ENTITIES
export type HabitType = 'check_in' | 'time_based' | 'count_based';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  subjectId?: string;
  goalId?: string;
  title: string;
  description?: string;
  type: HabitType;
  targetValue?: number; // duration in mins for time_based, count for count_based
  frequency: HabitFrequency;
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  preferredTime?: string; // e.g. "21:00"
  durationMinutes?: number;
  active: boolean;
  isPaused?: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt?: string;
  durationMinutes?: number;
  count?: number;
  linkedStudyPlanId?: string;
  linkedSessionId?: string;
}

// Study Session log entity
export interface StudySession {
  id: string;
  subjectId: string;
  topicId?: string;
  goalId?: string;
  habitId?: string;
  subjectName: string;
  topicName?: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  plannedDuration?: number;
  notes?: string;
  energyEarned: number;
}

// Study Plan mission entity
export interface StudyPlan {
  id: string;
  subjectId: string;
  topicId?: string;
  goalId?: string;
  habitId?: string;
  subjectName: string;
  topicName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  duration: number; // in minutes
  priority: PlanPriority;
  completed: boolean;
  completedAt?: string;
  deadline?: string;
}

export interface StreakInfo {
  current: number;
  max: number;
  lastStudiedDate: string | null;
  history: string[]; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity?: AchievementRarity;
  category: 'focus' | 'subject' | 'milestone' | 'streak' | 'special';
}

export interface UserSettings {
  name: string;
  theme: ThemeOption;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  dailyTargetMinutes: number;
  weeklyTargetMinutes: number;
}

export interface UserProgressState {
  user: UserSettings;
  subjects: Subject[];
  goals: Goal[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  sessions: StudySession[];
  plans: StudyPlan[];
  streak: StreakInfo;
  achievements: Achievement[];
}

export interface UserLevel {
  level: number;
  title: string;
  nextRankTitle: string;
  currentXp: number;
  xpForNextLevel: number;
  totalEnergyEarned: number;
}
