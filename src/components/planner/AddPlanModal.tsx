import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Subject, Goal, Topic, PlanPriority } from '../../types';
import { Calendar } from 'lucide-react';

export interface AddPlanModalProps {
  isOpen: boolean;
  subjects: Subject[];
  goals: Goal[];
  onClose: () => void;
  onCreatePlan: (
    subjectId: string,
    topicId: string | undefined,
    goalId: string | undefined,
    date: string,
    startTime: string,
    duration: number,
    priority: PlanPriority
  ) => void;
}

export const AddPlanModal: React.FC<AddPlanModalProps> = ({
  isOpen,
  subjects,
  goals,
  onClose,
  onCreatePlan,
}) => {
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || '');
  const [topicId, setTopicId] = useState<string>('');
  const [goalId, setGoalId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('18:00');
  const [duration, setDuration] = useState<number>(45);
  const [priority, setPriority] = useState<PlanPriority>('High');

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const availableTopics: Topic[] = selectedSubject
    ? selectedSubject.units.flatMap((u) => u.topics)
    : [];

  const availableGoals = goals.filter((g) => g.subjectId === subjectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;
    onCreatePlan(
      subjectId,
      topicId || undefined,
      goalId || undefined,
      date,
      startTime,
      duration,
      priority
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Study Plan Mission"
      subtitle="Assign a dedicated focus block to your cosmic schedule."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Subject & Topic Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Subject *
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicId('');
                setGoalId('');
              }}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Topic (Optional)
            </label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">General Subject Study</option>
              {availableTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Linked Goal Objective */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Linked Goal Objective (Optional)
          </label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
          >
            <option value="">No specific goal link</option>
            {availableGoals.map((g) => (
              <option key={g.id} value={g.id}>
                🎯 {g.title}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Start Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Duration & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              max="240"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 45)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Priority
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

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Calendar className="w-4 h-4" />}>
            Add Mission
          </Button>
        </div>
      </form>
    </Modal>
  );
};
