import React from 'react';
import type { StudySession } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Zap, Flame, Compass, FileText } from 'lucide-react';

export interface SessionCompleteModalProps {
  session: StudySession | null;
  streakCount: number;
  onClose: () => void;
}

export const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({
  session,
  streakCount,
  onClose,
}) => {
  if (!session) return null;

  return (
    <Modal isOpen={!!session} onClose={onClose} maxWidth="sm">
      <div className="text-center py-4 space-y-6">
        {/* Celestial Celebration Icon */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-amber-500 rounded-full blur-xl opacity-60 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl">
            <Sparkles className="w-8 h-8 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-mono font-bold block mb-1">
            SESSION COMPLETE
          </span>
          <h2 className="text-2xl font-bold font-heading text-white">
            {session.topicName || session.subjectName}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {session.duration} minutes of deep study completed.
          </p>
        </div>

        {/* Rewards Breakdown */}
        <div className="bg-[#10101c] border border-white/10 p-4 rounded-2xl space-y-3 text-xs font-mono text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Cosmic Energy Earned</span>
            </div>
            <span className="font-bold text-amber-400 text-sm">+{session.energyEarned} Energy</span>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span>Daily Study Streak</span>
            </div>
            <span className="font-bold text-white">{streakCount} Days</span>
          </div>

          {session.notes && (
            <div className="border-t border-white/10 pt-2">
              <div className="flex items-center gap-2 text-purple-300 mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Session Notes Saved:</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans italic bg-[#161628] p-2 rounded-lg truncate">
                "{session.notes}"
              </p>
            </div>
          )}
        </div>

        <Button variant="primary" onClick={onClose} className="w-full" icon={<Compass className="w-4 h-4" />}>
          Return to Galaxy
        </Button>
      </div>
    </Modal>
  );
};
