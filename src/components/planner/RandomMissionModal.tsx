import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Subject, Topic } from '../../types';
import { Sparkles, Zap, Shuffle } from 'lucide-react';

export interface RandomMissionModalProps {
  isOpen: boolean;
  subjects: Subject[];
  onClose: () => void;
  onAcceptMission: (subjectId: string, topicId: string, duration: number) => void;
}

export const RandomMissionModal: React.FC<RandomMissionModalProps> = ({
  isOpen,
  subjects,
  onClose,
  onAcceptMission,
}) => {
  const [selectedItem, setSelectedItem] = useState<{
    subject: Subject;
    topic: Topic;
  } | null>(null);

  const rollRandomMission = () => {
    const pool: { subject: Subject; topic: Topic }[] = [];
    subjects.forEach((subj) => {
      subj.units.forEach((u) => {
        u.topics.forEach((t) => {
          if (t.status === 'NOT_STARTED' || t.status === 'IN_PROGRESS') {
            pool.push({ subject: subj, topic: t });
          }
        });
      });
    });

    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setSelectedItem(pool[randomIndex]);
    } else {
      setSelectedItem(null);
    }
  };

  useEffect(() => {
    if (isOpen) rollRandomMission();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Random Mission Selector"
      subtitle="Let the cosmos guide your next focus session."
      maxWidth="md"
    >
      <div className="py-4 text-center">
        {selectedItem ? (
          <div className="bg-[#10101c] border border-purple-500/40 rounded-2xl p-6 mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <span className="block text-xs uppercase font-mono tracking-widest text-purple-400 font-semibold mb-1">
              YOUR NEXT MISSION
            </span>

            <h3 className="text-xl font-bold text-white font-heading mb-1">
              🪐 {selectedItem.subject.name}
            </h3>

            <p className="text-base text-slate-200 font-medium mb-4">
              {selectedItem.topic.name}
            </p>

            <div className="inline-flex items-center gap-3 bg-[#181828] border border-white/10 px-4 py-2 rounded-xl text-xs">
              <span className="text-slate-300 font-mono">
                Duration: {selectedItem.topic.estimatedMinutes || 45} mins
              </span>
              <span className="text-amber-400 font-mono font-semibold">
                +{selectedItem.topic.estimatedMinutes || 45} Energy
              </span>
            </div>
          </div>
        ) : (
          <div className="py-8 text-slate-400 text-sm">
            All topics are currently mastered! You have explored your entire universe.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {selectedItem && (
            <Button
              variant="primary"
              className="flex-1 font-semibold"
              onClick={() => {
                onAcceptMission(
                  selectedItem.subject.id,
                  selectedItem.topic.id,
                  selectedItem.topic.estimatedMinutes || 45
                );
                onClose();
              }}
              icon={<Zap className="w-4 h-4 fill-purple-200" />}
            >
              Accept Mission & Focus
            </Button>
          )}

          <Button variant="secondary" onClick={rollRandomMission} icon={<Shuffle className="w-4 h-4" />}>
            Reroll Mission
          </Button>
        </div>
      </div>
    </Modal>
  );
};
