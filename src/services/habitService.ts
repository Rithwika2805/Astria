import type { Habit, HabitCompletion } from '../types';

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
}

export interface HabitStatsResult {
  totalCompletions: number;
  thisMonthCompletions: number;
  thisMonthScheduled: number;
  completionRate: number;
}

export const HabitService = {
  /**
   * Determines if a habit is scheduled to occur on a given date (YYYY-MM-DD)
   */
  isHabitDueOnDate(habit: Habit, dateStr: string): boolean {
    if (!habit.active || habit.isPaused || habit.isArchived) return false;
    if (dateStr < habit.startDate) return false;
    if (habit.endDate && dateStr > habit.endDate) return false;

    // Parse day of week (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Add timezone offset safety by creating local date object
    const [year, month, day] = dateStr.split('-').map((v) => parseInt(v, 10));
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekly':
        if (habit.daysOfWeek && habit.daysOfWeek.length > 0) {
          return habit.daysOfWeek.includes(dayOfWeek);
        }
        // Fallback to start date day of week
        const [sY, sM, sD] = habit.startDate.split('-').map((v) => parseInt(v, 10));
        return dayOfWeek === new Date(sY, sM - 1, sD).getDay();
      case 'custom':
        if (!habit.daysOfWeek || habit.daysOfWeek.length === 0) return true;
        return habit.daysOfWeek.includes(dayOfWeek);
      default:
        return true;
    }
  },

  /**
   * Find completion record for a habit on a date
   */
  getHabitCompletion(
    completions: HabitCompletion[],
    habitId: string,
    dateStr: string
  ): HabitCompletion | undefined {
    return completions.find((c) => c.habitId === habitId && c.date === dateStr);
  },

  /**
   * Dynamically calculates current and longest streak from actual completion history
   */
  calculateHabitStreak(habit: Habit, completions: HabitCompletion[]): HabitStreakResult {
    const habitCompletions = completions.filter((c) => c.habitId === habit.id);
    if (habitCompletions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const completedDatesSet = new Set(habitCompletions.map((c) => c.date));

    // Walk backward from today
    const now = new Date();
    let currentStreak = 0;
    let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Format YYYY-MM-DD
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const todayStr = formatDate(checkDate);

    // If today is due but not completed yet, allow starting check from yesterday
    let isCheckingToday = true;
    let missedStreakBreak = false;

    for (let i = 0; i < 365; i++) {
      const dateStr = formatDate(checkDate);

      // Stop walking if we go past start date
      if (dateStr < habit.startDate) break;

      const isDue = this.isHabitDueOnDate(habit, dateStr);

      if (isDue) {
        const isCompleted = completedDatesSet.has(dateStr);

        if (isCompleted) {
          currentStreak += 1;
        } else {
          // If checking today and it's not completed yet, don't break streak yet (user still has time today)
          if (isCheckingToday && dateStr === todayStr) {
            // keep checking previous days
          } else {
            missedStreakBreak = true;
            break;
          }
        }
      }

      isCheckingToday = false;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Compute longest streak overall
    let longestStreak = currentStreak;
    let tempStreak = 0;
    let scanDate = new Date(habit.startDate);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    while (scanDate <= endDate) {
      const dateStr = formatDate(scanDate);
      if (this.isHabitDueOnDate(habit, dateStr)) {
        if (completedDatesSet.has(dateStr)) {
          tempStreak += 1;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 0;
        }
      }
      scanDate.setDate(scanDate.getDate() + 1);
    }

    return { currentStreak, longestStreak };
  },

  /**
   * Calculates metrics for habit detail panel
   */
  calculateHabitStats(habit: Habit, completions: HabitCompletion[]): HabitStatsResult {
    const habitCompletions = completions.filter((c) => c.habitId === habit.id);
    const totalCompletions = habitCompletions.length;

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const thisMonthCompletions = habitCompletions.filter((c) => c.date.startsWith(currentMonthStr)).length;

    // Count total scheduled occurrences in current month up to today
    let thisMonthScheduled = 0;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let scan = new Date(startOfMonth);
    while (scan <= today) {
      const dateStr = formatDate(scan);
      if (this.isHabitDueOnDate(habit, dateStr)) {
        thisMonthScheduled += 1;
      }
      scan.setDate(scan.getDate() + 1);
    }

    const completionRate =
      thisMonthScheduled > 0
        ? Math.min(100, Math.round((thisMonthCompletions / thisMonthScheduled) * 100))
        : 0;

    return {
      totalCompletions,
      thisMonthCompletions,
      thisMonthScheduled,
      completionRate,
    };
  },
};
