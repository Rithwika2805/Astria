import type { UserProgressState } from '../types';
import {
  INITIAL_USER_SETTINGS,
  INITIAL_SUBJECTS,
  INITIAL_GOALS,
  INITIAL_HABITS,
  INITIAL_HABIT_COMPLETIONS,
  INITIAL_SESSIONS,
  INITIAL_PLANS,
  INITIAL_ACHIEVEMENTS,
} from '../data/sampleData';

const STORAGE_KEY = 'astria_user_state_v4';

export const getInitialState = (): UserProgressState => ({
  user: INITIAL_USER_SETTINGS,
  subjects: INITIAL_SUBJECTS,
  goals: INITIAL_GOALS,
  habits: INITIAL_HABITS,
  habitCompletions: INITIAL_HABIT_COMPLETIONS,
  sessions: INITIAL_SESSIONS,
  plans: INITIAL_PLANS,
  achievements: INITIAL_ACHIEVEMENTS,
  streak: {
    current: 0,
    max: 0,
    lastStudiedDate: null,
    history: [],
  },
});

export const StorageService = {
  loadState(): UserProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getInitialState();
        this.saveState(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      return {
        user: { ...INITIAL_USER_SETTINGS, ...(parsed.user || {}) },
        subjects: parsed.subjects || INITIAL_SUBJECTS,
        goals: parsed.goals || INITIAL_GOALS,
        habits: parsed.habits || INITIAL_HABITS,
        habitCompletions: parsed.habitCompletions || INITIAL_HABIT_COMPLETIONS,
        sessions: parsed.sessions || INITIAL_SESSIONS,
        plans: parsed.plans || INITIAL_PLANS,
        achievements: parsed.achievements || INITIAL_ACHIEVEMENTS,
        streak: parsed.streak || {
          current: 0,
          max: 0,
          lastStudiedDate: null,
          history: [],
        },
      };
    } catch (err) {
      console.error('Failed to load Astria state from storage:', err);
      return getInitialState();
    }
  },

  saveState(state: UserProgressState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save Astria state to storage:', err);
    }
  },

  resetState(): UserProgressState {
    const initial = getInitialState();
    this.saveState(initial);
    return initial;
  },

  exportStateJson(state: UserProgressState): string {
    return JSON.stringify(state, null, 2);
  },

  importStateJson(jsonString: string): UserProgressState | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
        throw new Error('Invalid Astria backup JSON format.');
      }
      this.saveState(parsed);
      return parsed;
    } catch (err) {
      console.error('Failed to import JSON backup:', err);
      return null;
    }
  },
};
