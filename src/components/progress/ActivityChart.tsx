import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { StudySession } from '../../types';
import { AnalyticsService } from '../../services/analytics';
import { Card } from '../ui/Card';

export interface ActivityChartProps {
  sessions: StudySession[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ sessions }) => {
  const [daysTimeframe, setDaysTimeframe] = useState<7 | 14 | 30>(7);

  const data = AnalyticsService.getDailyActivityData(sessions, daysTimeframe);

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold font-heading text-white">Study Velocity & Output</h3>
          <p className="text-xs text-slate-400">Minutes of focused study recorded over time.</p>
        </div>

        <div className="flex items-center gap-1 bg-[#141424] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          {([7, 14, 30] as const).map((days) => (
            <button
              key={days}
              onClick={() => setDaysTimeframe(days)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                daysTimeframe === days
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0c16',
                borderColor: 'rgba(168,85,247,0.4)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any) => [`${val} minutes`, 'Focus Time']}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#a855f7"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#areaGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
