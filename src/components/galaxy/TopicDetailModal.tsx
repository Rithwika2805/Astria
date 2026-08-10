import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Topic, TopicStatus } from '../../types';
import { formatMinutes } from '../../utils/formatting';
import { Star, Zap, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export interface TopicDetailModalProps {
  isOpen: boolean;
  topic: Topic;
  subjectName: string;
  onClose: () => void;
  onStartFocus: (topicId: string) => void;
  onUpdateStatus: (topicId: string, status: TopicStatus) => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  isOpen,
  topic,
  subjectName,
  onClose,
  onStartFocus,
  onUpdateStatus,
}) => {
  const isMastered = topic.status === 'MASTERED';
  const isCompleted = topic.status === 'COMPLETED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={topic.name} subtitle={subjectName} maxWidth="md">
      <div className="space-y-6 pt-2">
        {/* Status & Badge Row */}
        <div className="flex items-center justify-between bg-[#141422] p-4 rounded-xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 uppercase font-mono">Current Status</span>
              <div className="mt-0.5">
                {isMastered ? (
                  <Badge variant="gold" icon={<Sparkles className="w-3 h-3" />}>Mastered</Badge>
                ) : isCompleted ? (
                  <Badge variant="teal" icon={<CheckCircle2 className="w-3 h-3" />}>Completed</Badge>
                ) : topic.status === 'IN_PROGRESS' ? (
                  <Badge variant="purple">In Progress</Badge>
                ) : (
                  <Badge variant="gray">Not Started</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] text-slate-400 uppercase font-mono">Time Spent</span>
            <span className="font-semibold text-slate-200 text-sm">
              {formatMinutes(topic.studiedMinutes)} / {topic.estimatedMinutes}m
            </span>
          </div>
        </div>

        {/* Topic Notes / Context */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">Topic Notes</label>
          <div className="bg-[#10101a] border border-white/10 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[70px]">
            {topic.notes || 'No notes added yet for this topic star. Launch a focus session to record study minutes.'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onStartFocus(topic.id)}
            icon={<Zap className="w-4 h-4 fill-purple-200" />}
          >
            Start Focus Session
          </Button>

          {!isMastered && (
            <Button
              variant="outline"
              onClick={() => onUpdateStatus(topic.id, isCompleted ? 'MASTERED' : 'COMPLETED')}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isCompleted ? 'Mark Mastered' : 'Mark Completed'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
