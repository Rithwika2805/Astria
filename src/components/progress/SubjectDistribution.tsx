import React from 'react';
import { Subject, StudySession } from '../../types';
import { AnalyticsService } from '../../services/analytics';
import { Card } from '../ui/Card';
import { formatMinutes } from '../../utils/formatting';

export interface SubjectDistributionProps {
  subjects: Subject[];
  sessions: StudySession[];
}

export const SubjectDistribution: React.FC<SubjectDistributionProps> = ({ subjects, sessions }) => {
  const distribution = AnalyticsService.getSubjectDistribution(subjects, sessions);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold font-heading text-white mb-1">Subject Distribution</h3>
      <p className="text-xs text-slate-400 mb-6">Percentage of total study energy spent on each planet world.</p>

      <div className="space-y-4">
        {distribution.map((item) => (
          <div key={item.subjectId} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-200">{item.name}</span>
              </div>
              <span className="font-mono text-slate-400">
                {formatMinutes(item.minutes)} ({item.percentage}%)
              </span>
            </div>

            <div className="h-2 w-full bg-[#181824] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                  boxShadow: `0 0 10px ${item.color}88`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
