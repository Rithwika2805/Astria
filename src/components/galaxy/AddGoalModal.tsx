import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Subject, GoalType, PlanPriority } from '../../types';
import { Target } from 'lucide-react';

export interface AddGoalModalProps {
  isOpen: boolean;
  subjects: Subject[];
  initialSubjectId?: string;
  onClose: () => void;
  onCreateGoal: (
    subjectId: string,
    title: string,
    type: GoalType,
    targetValue?: number,
    unitLabel?: string,
    deadline?: string,
    priority?: PlanPriority,
    linkedTopicIds?: string[]
  ) => void;
}

export const AddGoalModal: React.FC<AddGoalModalProps> = ({
  isOpen,
  subjects,
  initialSubjectId,
  onClose,
  onCreateGoal,
}) => {
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId || subjects[0]?.id || '');
  const [title, setTitle] = useState<string>('');
  const [goalType, setGoalType] = useState<GoalType>('study_time');
  const [targetValue, setTargetValue] = useState<number>(10);
  const [unitLabel, setUnitLabel] = useState<string>('hours');
  const [deadline, setDeadline] = useState<string>('');
  const [priority, setPriority] = useState<PlanPriority>('High');

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const availableTopics = selectedSubject
    ? selectedSubject.units.flatMap((u) => u.topics)
    : [];

  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    onCreateGoal(
      subjectId,
      title.trim(),
      goalType,
      goalType !== 'boolean' ? targetValue : undefined,
      goalType !== 'boolean' ? unitLabel : undefined,
      deadline || undefined,
      priority,
      selectedTopicIds
    );

    setTitle('');
    setDeadline('');
    setSelectedTopicIds([]);
    onClose();
  };

  const toggleTopicSelection = (tId: string) => {
    setSelectedTopicIds((prev) =>
      prev.includes(tId) ? prev.filter((id) => id !== tId) : [...prev, tId]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Subject Goal Objective"
      subtitle="Define a measurable goal to drive your daily study focus."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Subject Dropdown */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Subject Planet *
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Goal Title */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Goal Objective Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Study 10 Hours of ML Foundations, Solve 25 Problems"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Goal Type Picker */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
            Goal Type & Progress Calculation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'study_time', label: 'Study Hours (Auto-derived from Focus)', unit: 'hours' },
              { type: 'topic_count', label: 'Topic Completion (Auto-derived)', unit: 'topics' },
              { type: 'quantitative', label: 'Quantitative Target (Custom count)', unit: 'units' },
              { type: 'boolean', label: 'Simple Checkmark (Incomplete/Done)', unit: '' },
            ].map((gt) => (
              <button
                key={gt.type}
                type="button"
                onClick={() => {
                  setGoalType(gt.type as GoalType);
                  if (gt.unit) setUnitLabel(gt.unit);
                }}
                className={`p-3 rounded-xl border text-xs font-medium cursor-pointer text-left transition-all ${
                  goalType === gt.type
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow-lg'
                    : 'border-white/10 bg-[#10101a] text-slate-400 hover:text-white'
                }`}
              >
                {gt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Value & Unit Label (for non-boolean) */}
        {goalType !== 'boolean' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={targetValue}
                onChange={(e) => setTargetValue(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Unit Label
              </label>
              <input
                type="text"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="hours, problems, lectures"
              />
            </div>
          </div>
        )}

        {/* Deadline & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Target Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PlanPriority)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Linked Topics Checklist */}
        {availableTopics.length > 0 && (
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Link Relevant Topics
            </label>
            <div className="max-h-32 overflow-y-auto bg-[#10101a] border border-white/10 p-2 rounded-xl space-y-1">
              {availableTopics.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 text-xs text-slate-300 p-1 rounded hover:bg-white/5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTopicIds.includes(t.id)}
                    onChange={() => toggleTopicSelection(t.id)}
                    className="rounded accent-purple-500"
                  />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Target className="w-4 h-4" />}>
            Create Goal Objective
          </Button>
        </div>
      </form>
    </Modal>
  );
};
