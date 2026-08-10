import React from 'react';
import { Subject, StudySession } from '../../types';
import { AnalyticsService } from '../../services/analytics';
import { Card } from '../ui/Card';
import { Compass, Clock, Globe, Zap, TrendingUp } from 'lucide-react';

export interface InsightsListProps {
  subjects: Subject[];
  sessions: StudySession[];
}

export const InsightsList: React.FC<InsightsListProps> = ({ subjects, sessions }) => {
  const insights = AnalyticsService.generateInsights(subjects, sessions);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-5 h-5 text-purple-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-teal-400" />;
      default:
        return <Compass className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-heading text-white">Productivity Insights</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => (
          <Card key={item.id} className="p-5 flex items-start gap-4 border-white/10 hover:border-purple-500/30">
            <div className="p-3 rounded-2xl bg-[#141424] border border-white/10 shrink-0">
              {getIcon(item.icon)}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white mb-1">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
