import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { Subject, Goal, HabitType, HabitFrequency } from '../../types';
import { Repeat } from 'lucide-react';

export interface CreateHabitModalProps {
  isOpen: boolean;
  subjects: Subject[];
  goals: Goal[];
  initialSubjectId?: string;
  initialGoalId?: string;
  onClose: () => void;
  onCreateHabit: (
    title: string,
    type: HabitType,
    frequency: HabitFrequency,
    subjectId?: string,
    goalId?: string,
    description?: string,
    targetValue?: number,
    daysOfWeek?: number[],
    preferredTime?: string,
    startDate?: string
  ) => void;
}

const DAYS_MAP = [
  { idx: 1, label: 'Mon' },
  { idx: 2, label: 'Tue' },
  { idx: 3, label: 'Wed' },
  { idx: 4, label: 'Thu' },
  { idx: 5, label: 'Fri' },
  { idx: 6, label: 'Sat' },
  { idx: 0, label: 'Sun' },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  subjects,
  goals,
  initialSubjectId,
  initialGoalId,
  onClose,
  onCreateHabit,
}) => {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(initialSubjectId || '');
  const [goalId, setGoalId] = useState(initialGoalId || '');
  const [type, setType] = useState<HabitType>('time_based');
  const [targetValue, setTargetValue] = useState(45);
  const [frequency, setFrequency] = useState<HabitFrequency>('weekdays');
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [preferredTime, setPreferredTime] = useState('21:00');

  const availableGoals = subjectId
    ? goals.filter((g) => g.subjectId === subjectId)
    : goals;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreateHabit(
      title.trim(),
      type,
      frequency,
      subjectId || undefined,
      goalId || undefined,
      undefined,
      targetValue,
      frequency === 'custom' ? customDays : frequency === 'weekdays' ? [1, 2, 3, 4, 5] : undefined,
      preferredTime || undefined
    );

    setTitle('');
    onClose();
  };

  const toggleCustomDay = (dIdx: number) => {
    setCustomDays((prev) =>
      prev.includes(dIdx) ? prev.filter((d) => d !== dIdx) : [...prev, dIdx]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CREATE A ROUTINE"
      subtitle="Small actions, repeated often, shape your universe."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Habit Name */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Habit Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Study AI for 45 mins, Solve 2 DSA problems"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            autoFocus
          />
        </div>

        {/* Optional Subject */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
            Optional Subject Planet
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setGoalId('');
            }}
            className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="">General Routine (No Planet)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Habit Type */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
            Routine Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'check_in', label: 'Check-in', desc: 'Simple Done/Not Done' },
              { id: 'time_based', label: 'Time-based', desc: 'Study focus minutes' },
              { id: 'count_based', label: 'Count-based', desc: 'Repeat completion target' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setType(t.id as HabitType);
                  if (t.id === 'time_based') setTargetValue(45);
                  if (t.id === 'count_based') setTargetValue(2);
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  type === t.id
                    ? 'border-purple-500 bg-purple-950/40 text-white shadow'
                    : 'border-white/10 bg-[#10101a] text-slate-400 hover:text-white'
                }`}
              >
                <span className="block text-xs font-semibold">{t.label}</span>
                <span className="block text-[10px] text-slate-400 leading-tight mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Value input based on type */}
        {type === 'time_based' && (
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Target Duration (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="240"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 45)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {type === 'count_based' && (
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Target Count (e.g. 2 problems)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 1)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Recurrence Frequency */}
        <div>
          <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
            Repeat Schedule
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[
              { id: 'daily', label: 'Every day' },
              { id: 'weekdays', label: 'Weekdays' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'custom', label: 'Custom' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id as HabitFrequency)}
                className={`py-2 px-1 rounded-xl border text-xs font-medium cursor-pointer text-center transition-all ${
                  frequency === f.id
                    ? 'border-purple-500 bg-purple-950/40 text-white'
                    : 'border-white/10 bg-[#10101a] text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Custom Day Selector */}
          {frequency === 'custom' && (
            <div className="flex items-center gap-1.5 pt-1">
              {DAYS_MAP.map((d) => (
                <button
                  key={d.idx}
                  type="button"
                  onClick={() => toggleCustomDay(d.idx)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                    customDays.includes(d.idx)
                      ? 'border-purple-500 bg-purple-600 text-white'
                      : 'border-white/10 bg-[#10101a] text-slate-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Time & Optional Goal */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Preferred Time
            </label>
            <input
              type="time"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
              Optional Linked Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">No goal link</option>
              {availableGoals.map((g) => (
                <option key={g.id} value={g.id}>
                  🎯 {g.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Repeat className="w-4 h-4" />}>
            Create Habit
          </Button>
        </div>
      </form>
    </Modal>
  );
};
