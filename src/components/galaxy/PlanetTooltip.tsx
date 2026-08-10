import React from 'react';
import { Subject } from '../../types';
import { ProgressionService } from '../../services/progression';
import { formatMinutes } from '../../utils/formatting';
import { Button } from '../ui/Button';
import { Sparkles, Globe, Clock, CheckCircle2 } from 'lucide-react';

export interface PlanetTooltipProps {
  subject: Subject;
  x: number;
  y: number;
  onOpenWorld: (subjectId: string) => void;
}

export const PlanetTooltip: React.FC<PlanetTooltipProps> = ({
  subject,
  x,
  y,
  onOpenWorld,
}) => {
  const stats = ProgressionService.calculateSubjectStats(subject);

  return (
    <div
      style={{ left: `${x}px`, top: `${y}px` }}
      className="absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+16px)] pointer-events-auto"
    >
      <div className="w-64 bg-[#0c0c16]/95 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-purple-950/50 text-slate-100">
        {/* Glow indicator line */}
        <div
          className="h-1 rounded-full w-full mb-3"
          style={{
            background: `linear-gradient(to right, ${subject.color}, ${subject.secondaryColor || '#a855f7'})`,
          }}
        />

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: subject.color }} />
            <h4 className="font-semibold font-heading text-sm text-white truncate">{subject.name}</h4>
          </div>
          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
            {stats.percentage}%
          </span>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {subject.description || 'Explore units and master stars.'}
        </p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-[#141422] p-2 rounded-xl border border-white/5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Studied</span>
              <span className="font-semibold text-slate-200">{formatMinutes(stats.totalStudiedMinutes)}</span>
            </div>
          </div>
          <div className="bg-[#141422] p-2 rounded-xl border border-white/5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <div>
              <span className="block text-[10px] text-slate-400">Mastered</span>
              <span className="font-semibold text-slate-200">{stats.masteredTopics} / {stats.totalTopics}</span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => onOpenWorld(subject.id)}
          icon={<Sparkles className="w-3.5 h-3.5" />}
          className="w-full font-medium"
        >
          Open World
        </Button>
      </div>

      {/* Tooltip Pointer Triangle */}
      <div className="w-3 h-3 bg-[#0c0c16] border-r border-b border-purple-500/30 rotate-45 mx-auto -mt-1.5" />
    </div>
  );
};
