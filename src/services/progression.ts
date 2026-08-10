import type {
  Subject,
  Unit,
  Topic,
  StudySession,
  Goal,
  Achievement,
  UserLevel,
  SubjectMomentum,
} from '../types';

export interface SubjectStats {
  subjectId: string;
  totalTopics: number;
  completedTopics: number;
  masteredTopics: number;
  totalEstimatedMinutes: number;
  totalStudiedMinutes: number;
  percentage: number;
  isFullyExplored: boolean;
  momentum: SubjectMomentum;
}

export interface UnitConstellationStats {
  unitId: string;
  unitName: string;
  totalTopics: number;
  completedTopics: number;
  isDiscovered: boolean;
}

export interface CalculatedGoalProgress {
  goalId: string;
  currentValue: number;
  targetValue: number;
  unitLabel: string;
  percentage: number;
  isCompleted: boolean;
  displayText: string;
}

export const ProgressionService = {
  /**
   * Calculates subject momentum dynamically from recent 7-day study history & goal deadlines
   */
  calculateSubjectMomentum(
    subject: Subject,
    sessions: StudySession[],
    goals: Goal[]
  ): SubjectMomentum {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Sum recent study minutes for this subject
    const recentMinutes = sessions
      .filter((s) => s.subjectId === subject.id && new Date(s.startTime) >= sevenDaysAgo)
      .reduce((acc, s) => acc + s.duration, 0);

    // Check for urgent/overdue goals
    const subjectGoals = goals.filter((g) => g.subjectId === subject.id && !g.completed);
    const hasUrgentGoal = subjectGoals.some((g) => {
      if (!g.deadline) return false;
      const due = new Date(g.deadline);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 3; // 3 days or overdue
    });

    if (hasUrgentGoal && recentMinutes < 30) return 'NEEDS_ATTENTION';
    if (recentMinutes >= 120) return 'HIGH';
    if (recentMinutes >= 30) return 'GROWING';
    return 'DORMANT';
  },

  /**
   * Calculates detailed statistics for a single subject
   */
  calculateSubjectStats(subject: Subject, sessions: StudySession[] = [], goals: Goal[] = []): SubjectStats {
    let totalTopics = 0;
    let completedTopics = 0;
    let masteredTopics = 0;
    let totalEstimatedMinutes = 0;
    let totalStudiedMinutes = 0;

    subject.units.forEach((unit) => {
      unit.topics.forEach((topic) => {
        totalTopics += 1;
        totalEstimatedMinutes += topic.estimatedMinutes;
        totalStudiedMinutes += topic.studiedMinutes;

        if (topic.status === 'COMPLETED' || topic.status === 'MASTERED') {
          completedTopics += 1;
        }
        if (topic.status === 'MASTERED') {
          masteredTopics += 1;
        }
      });
    });

    const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    const isFullyExplored = totalTopics > 0 && completedTopics === totalTopics;
    const momentum = this.calculateSubjectMomentum(subject, sessions, goals);

    return {
      subjectId: subject.id,
      totalTopics,
      completedTopics,
      masteredTopics,
      totalEstimatedMinutes,
      totalStudiedMinutes,
      percentage,
      isFullyExplored,
      momentum,
    };
  },

  /**
   * Auto-derives progress for a single goal based on goal type & linked sessions/topics
   */
  calculateGoalProgress(
    goal: Goal,
    sessions: StudySession[],
    subjects: Subject[]
  ): CalculatedGoalProgress {
    let currentValue = goal.currentValue || 0;
    let targetValue = goal.targetValue || 1;
    let unitLabel = goal.unitLabel || '';

    // Collect all topics across subjects
    const allTopics: Topic[] = [];
    subjects.forEach((s) => s.units.forEach((u) => allTopics.push(...u.topics)));

    if (goal.type === 'study_time') {
      unitLabel = goal.unitLabel || 'hours';
      // Sum minutes from sessions matching goalId or linkedTopics
      const matchingMinutes = sessions
        .filter((s) => s.goalId === goal.id || (goal.linkedTopicIds.length > 0 && s.topicId && goal.linkedTopicIds.includes(s.topicId)))
        .reduce((acc, s) => acc + s.duration, 0);

      currentValue = Math.round((matchingMinutes / 60) * 10) / 10; // in hours with 1 decimal
    } else if (goal.type === 'topic_count') {
      unitLabel = goal.unitLabel || 'topics';
      const linkedTopics = allTopics.filter((t) => goal.linkedTopicIds.includes(t.id));
      targetValue = goal.targetValue || Math.max(1, linkedTopics.length);
      currentValue = linkedTopics.filter((t) => t.status === 'COMPLETED' || t.status === 'MASTERED').length;
    } else if (goal.type === 'boolean') {
      unitLabel = 'status';
      targetValue = 1;
      currentValue = goal.completed ? 1 : 0;
    }

    const percentage = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0;
    const isCompleted = goal.completed || percentage >= 100;

    let displayText = '';
    if (goal.type === 'study_time') {
      displayText = `${currentValue}h / ${targetValue}h`;
    } else if (goal.type === 'topic_count') {
      displayText = `${currentValue} / ${targetValue} topics`;
    } else if (goal.type === 'quantitative') {
      displayText = `${currentValue} / ${targetValue} ${unitLabel}`;
    } else {
      displayText = isCompleted ? 'Completed' : 'Incomplete';
    }

    return {
      goalId: goal.id,
      currentValue,
      targetValue,
      unitLabel,
      percentage,
      isCompleted,
      displayText,
    };
  },

  /**
   * Calculates overall universe progress stats
   */
  calculateUniverseStats(subjects: Subject[], sessions: StudySession[]) {
    let totalTopics = 0;
    let completedTopics = 0;
    let masteredTopics = 0;

    subjects.forEach((subj) => {
      subj.units.forEach((u) => {
        u.topics.forEach((t) => {
          totalTopics += 1;
          if (t.status === 'COMPLETED' || t.status === 'MASTERED') completedTopics += 1;
          if (t.status === 'MASTERED') masteredTopics += 1;
        });
      });
    });

    const totalSessionMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const overallPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    return {
      totalSubjects: subjects.length,
      totalTopics,
      completedTopics,
      masteredTopics,
      totalStudiedMinutes: totalSessionMinutes,
      overallPercentage,
    };
  },

  /**
   * Calculates RPG user level with refined ranks
   */
  calculateUserLevel(totalEnergyEarned: number): UserLevel {
    let level = 1;
    let energyForCurrentLevel = 0;
    let energyForNextLevel = 150;

    while (totalEnergyEarned >= energyForNextLevel) {
      level += 1;
      energyForCurrentLevel = energyForNextLevel;
      energyForNextLevel += level * 150;
    }

    const currentXp = totalEnergyEarned - energyForCurrentLevel;
    const xpForNextLevel = energyForNextLevel - energyForCurrentLevel;

    const rankTitles = [
      'First Light',
      'Skywatcher',
      'Star Seeker',
      'Student Stargazer',
      'Cosmic Scholar',
      'Constellation Keeper',
      'Astral Scholar',
      'Master of Stars',
      'Grandmaster of the Universe',
    ];

    const titleIdx = Math.min(rankTitles.length - 1, level - 1);
    const nextIdx = Math.min(rankTitles.length - 1, level);

    return {
      level,
      title: rankTitles[titleIdx],
      nextRankTitle: rankTitles[nextIdx],
      currentXp,
      xpForNextLevel,
      totalEnergyEarned,
    };
  },

  /**
   * Check if a unit has formed a constellation
   */
  getUnitConstellationStatus(unit: Unit): UnitConstellationStats {
    const totalTopics = unit.topics.length;
    const completedTopics = unit.topics.filter(
      (t) => t.status === 'COMPLETED' || t.status === 'MASTERED'
    ).length;
    return {
      unitId: unit.id,
      unitName: unit.name,
      totalTopics,
      completedTopics,
      isDiscovered: totalTopics > 0 && completedTopics === totalTopics,
    };
  },

  /**
   * Evaluates achievements list
   */
  evaluateAchievements(
    achievements: Achievement[],
    subjects: Subject[],
    sessions: StudySession[],
    streakCount: number,
    totalEnergy: number
  ): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } {
    const newlyUnlocked: Achievement[] = [];
    const updated = achievements.map((ach) => {
      let progress = ach.progress;
      let unlocked = ach.unlocked;

      switch (ach.id) {
        case 'first-light':
          progress = sessions.length > 0 ? 1 : 0;
          break;
        case 'first-world':
          progress = subjects.length > 0 ? 1 : 0;
          break;
        case 'new-star': {
          let hasCompletedTopic = false;
          subjects.forEach((s) =>
            s.units.forEach((u) =>
              u.topics.forEach((t) => {
                if (t.status === 'COMPLETED' || t.status === 'MASTERED') hasCompletedTopic = true;
              })
            )
          );
          progress = hasCompletedTopic ? 1 : 0;
          break;
        }
        case 'constellation': {
          let hasConstellation = false;
          subjects.forEach((s) =>
            s.units.forEach((u) => {
              if (this.getUnitConstellationStatus(u).isDiscovered) hasConstellation = true;
            })
          );
          progress = hasConstellation ? 1 : 0;
          break;
        }
        case 'supernova': {
          let hasFullSubject = false;
          subjects.forEach((s) => {
            if (this.calculateSubjectStats(s, sessions).isFullyExplored) hasFullSubject = true;
          });
          progress = hasFullSubject ? 1 : 0;
          break;
        }
        case 'night-owl': {
          const hasLateSession = sessions.some((s) => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 21 || hour <= 4;
          });
          progress = hasLateSession ? 1 : 0;
          break;
        }
        case 'marathon': {
          const hasLongSession = sessions.some((s) => s.duration >= 60);
          progress = hasLongSession ? 1 : 0;
          break;
        }
        case 'consistency-7':
          progress = Math.min(streakCount, 7);
          break;
        case 'century':
          progress = Math.min(totalEnergy, 6000);
          break;
      }

      if (!unlocked && progress >= ach.maxProgress) {
        unlocked = true;
        newlyUnlocked.push({
          ...ach,
          progress,
          unlocked: true,
          unlockedAt: new Date().toISOString().split('T')[0],
        });
      }

      return {
        ...ach,
        progress,
        unlocked,
        unlockedAt: unlocked ? ach.unlockedAt || new Date().toISOString().split('T')[0] : undefined,
      };
    });

    return { updatedAchievements: updated, newlyUnlocked };
  },
};
