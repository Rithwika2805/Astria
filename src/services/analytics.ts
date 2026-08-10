import type { StudySession, Subject, Goal, Topic } from '../types';
import { ProgressionService } from './progression';

export interface DayActivity {
  date: string;
  dayLabel: string;
  minutes: number;
}

export interface SubjectDistributionItem {
  subjectId: string;
  name: string;
  color: string;
  minutes: number;
  percentage: number;
}

export interface ProductivityInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'highlight';
}

export interface SmartRecommendation {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  goalId?: string;
  goalTitle?: string;
  reason: string;
  suggestedDuration: number;
}

export const AnalyticsService = {
  formatDuration(totalMinutes: number): { hours: number; minutes: number; text: string } {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return { hours, minutes, text: `${minutes}m` };
    if (minutes === 0) return { hours, minutes, text: `${hours}h` };
    return { hours, minutes, text: `${hours}h ${minutes}m` };
  },

  getDailyActivityData(sessions: StudySession[], days: number = 7): DayActivity[] {
    const result: DayActivity[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const daysSessions = sessions.filter((s) => s.startTime.startsWith(dateStr));
      const minutes = daysSessions.reduce((acc, s) => acc + s.duration, 0);

      result.push({
        date: dateStr,
        dayLabel: days === 7 ? dayLabel : `${d.getMonth() + 1}/${d.getDate()}`,
        minutes,
      });
    }

    return result;
  },

  getSubjectDistribution(subjects: Subject[], sessions: StudySession[]): SubjectDistributionItem[] {
    const map = new Map<string, number>();

    subjects.forEach((subj) => {
      const stats = ProgressionService.calculateSubjectStats(subj, sessions);
      map.set(subj.id, stats.totalStudiedMinutes);
    });

    sessions.forEach((sess) => {
      const current = map.get(sess.subjectId) || 0;
      map.set(sess.subjectId, current + sess.duration);
    });

    const totalMinutesAll = Array.from(map.values()).reduce((a, b) => a + b, 0);

    return subjects.map((subj) => {
      const mins = map.get(subj.id) || 0;
      const pct = totalMinutesAll > 0 ? Math.round((mins / totalMinutesAll) * 100) : 0;
      return {
        subjectId: subj.id,
        name: subj.name,
        color: subj.color,
        minutes: mins,
        percentage: pct,
      };
    });
  },

  /**
   * Deterministic smart recommendations algorithm
   */
  getSmartRecommendations(
    subjects: Subject[],
    goals: Goal[],
    sessions: StudySession[]
  ): SmartRecommendation[] {
    const recs: SmartRecommendation[] = [];

    // Rule 1: Incomplete high-priority goal near deadline
    const urgentGoal = goals.find((g) => {
      if (g.completed || !g.deadline) return false;
      const due = new Date(g.deadline);
      const diff = (due.getTime() - Date.now()) / (1000 * 3600 * 24);
      return diff <= 5;
    });

    if (urgentGoal) {
      const subj = subjects.find((s) => s.id === urgentGoal.subjectId);
      if (subj) {
        let topic: Topic | undefined;
        subj.units.forEach((u) => {
          const t = u.topics.find((tp) => urgentGoal.linkedTopicIds.includes(tp.id) && tp.status !== 'MASTERED');
          if (t) topic = t;
        });

        recs.push({
          id: `rec-urgent-${urgentGoal.id}`,
          subjectId: subj.id,
          subjectName: subj.name,
          topicId: topic?.id,
          topicName: topic?.name || 'General Focus',
          goalId: urgentGoal.id,
          goalTitle: urgentGoal.title,
          reason: 'High-priority goal approaching deadline.',
          suggestedDuration: 45,
        });
      }
    }

    // Rule 2: Near completion constellation/unit
    subjects.forEach((subj) => {
      subj.units.forEach((u) => {
        const stats = ProgressionService.getUnitConstellationStatus(u);
        if (!stats.isDiscovered && stats.totalTopics - stats.completedTopics === 1) {
          const remainingTopic = u.topics.find((t) => t.status !== 'COMPLETED' && t.status !== 'MASTERED');
          if (remainingTopic) {
            recs.push({
              id: `rec-const-${u.id}`,
              subjectId: subj.id,
              subjectName: subj.name,
              topicId: remainingTopic.id,
              topicName: remainingTopic.name,
              reason: `1 topic remaining to unlock ${u.name} Constellation ✨`,
              suggestedDuration: 45,
            });
          }
        }
      });
    });

    return recs;
  },

  generateInsights(subjects: Subject[], sessions: StudySession[]): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];

    if (sessions.length === 0) {
      insights.push({
        id: 'no-data',
        icon: 'Compass',
        title: 'Begin Your Odyssey',
        description: 'Complete your first focus session to unlock custom study pattern insights.',
        type: 'neutral',
      });
      return insights;
    }

    // Peak Hour
    const hourCounts: { [hour: number]: number } = {};
    sessions.forEach((s) => {
      const hour = new Date(s.startTime).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + s.duration;
    });

    let peakHour = 19;
    let maxHourMins = 0;
    Object.entries(hourCounts).forEach(([hStr, mins]) => {
      const h = parseInt(hStr, 10);
      if (mins > maxHourMins) {
        maxHourMins = mins;
        peakHour = h;
      }
    });

    const formatHour = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12} ${ampm}`;
    };

    insights.push({
      id: 'peak-time',
      icon: 'Clock',
      title: 'Strongest Orbit Window',
      description: `You are most consistent around ${formatHour(peakHour)} – ${formatHour((peakHour + 2) % 24)}.`,
      type: 'highlight',
    });

    // Top Subject
    const dist = this.getSubjectDistribution(subjects, sessions);
    if (dist.length > 0) {
      const sorted = [...dist].sort((a, b) => b.minutes - a.minutes);
      const top = sorted[0];
      if (top && top.minutes > 0) {
        insights.push({
          id: 'top-subject',
          icon: 'Globe',
          title: 'Most Explored Planet',
          description: `${top.name} receives ${top.percentage}% of your study velocity (${Math.round(top.minutes / 60)} hours).`,
          type: 'positive',
        });
      }
    }

    // Sweet Spot Session Length
    const avgMins = Math.round(sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length);
    insights.push({
      id: 'avg-session',
      icon: 'Zap',
      title: 'Optimal Session Sweet Spot',
      description: `Your average focus session is ${avgMins} minutes. Your 45–60 minute sessions appear to be your sweet spot.`,
      type: 'neutral',
    });

    return insights;
  },
};
