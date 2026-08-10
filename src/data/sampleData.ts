import type { Subject, Goal, Habit, HabitCompletion, StudySession, StudyPlan, Achievement, UserSettings } from '../types';

export const INITIAL_USER_SETTINGS: UserSettings = {
  name: 'Stargazer',
  theme: 'cosmic-dark',
  soundEnabled: true,
  animationsEnabled: true,
  reducedMotion: false,
  dailyTargetMinutes: 120,
  weeklyTargetMinutes: 720,
};

export const INITIAL_SUBJECTS: Subject[] = [];

export const INITIAL_GOALS: Goal[] = [];

export const INITIAL_HABITS: Habit[] = [];

export const INITIAL_HABIT_COMPLETIONS: HabitCompletion[] = [];

export const INITIAL_SESSIONS: StudySession[] = [];

export const INITIAL_PLANS: StudyPlan[] = [];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-light',
    title: 'First Light',
    description: 'Complete your first focus study session.',
    icon: 'Sparkles',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'COMMON',
    category: 'focus',
  },
  {
    id: 'first-world',
    title: 'First World',
    description: 'Create your first subject planet in your universe.',
    icon: 'Globe',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'COMMON',
    category: 'subject',
  },
  {
    id: 'new-star',
    title: 'New Star',
    description: 'Complete your first topic star.',
    icon: 'Star',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'COMMON',
    category: 'milestone',
  },
  {
    id: 'constellation',
    title: 'Constellation Keeper',
    description: 'Master all topics inside a single unit module.',
    icon: 'Orbit',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'EPIC',
    category: 'milestone',
  },
  {
    id: 'supernova',
    title: 'Supernova Burst',
    description: 'Reach a major milestone or 100% subject mastery.',
    icon: 'Zap',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'LEGENDARY',
    category: 'special',
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Complete a study session past 9 PM.',
    icon: 'Moon',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'RARE',
    category: 'special',
  },
  {
    id: 'marathon',
    title: 'Marathon Scholar',
    description: 'Complete a single study session of 60 minutes or longer.',
    icon: 'Flame',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'RARE',
    category: 'focus',
  },
  {
    id: 'consistency-7',
    title: 'Orbiting Momentum',
    description: 'Maintain a 7-day study streak.',
    icon: 'Compass',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    rarity: 'EPIC',
    category: 'streak',
  },
  {
    id: 'century',
    title: 'Cosmic Century',
    description: 'Accumulate 100 total study hours (6,000 Cosmic Energy).',
    icon: 'Trophy',
    unlocked: false,
    progress: 0,
    maxProgress: 6000,
    rarity: 'LEGENDARY',
    category: 'milestone',
  },
];
