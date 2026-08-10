import React, { useState } from 'react';
import type { Subject, Goal } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Zap, Play, Globe } from 'lucide-react';

export interface FocusPageProps {
  subjects: Subject[];
  goals: Goal[];
  onLaunchFocus: (subjectId: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
}

const PRESETS = [15, 25, 45, 60, 90];

export const FocusPage: React.FC<FocusPageProps> = ({ subjects, goals, onLaunchFocus }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const topics: { id: string; name: string }[] = [];
  if (selectedSubject) {
    selectedSubject.units.forEach((u) => {
      u.topics.forEach((t) => topics.push({ id: t.id, name: t.name }));
    });
  }

  const subjectGoals = goals.filter((g) => g.subjectId === selectedSubjectId);

  const handleLaunch = () => {
    if (!selectedSubjectId) return;
    onLaunchFocus(
      selectedSubjectId,
      selectedTopicId || undefined,
      durationMinutes,
      selectedGoalId || undefined
    );
  };

  if (subjects.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-400">
        <Globe className="w-16 h-16 mx-auto mb-4 text-purple-400/50 animate-pulse" />
        <h2 className="text-2xl font-bold font-heading text-white mb-2">No Planets Created Yet</h2>
        <p className="text-xs mb-6 leading-relaxed">
          Create your first subject planet world before starting a focused study session.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-950/60">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <h1 className="text-3xl font-bold font-heading text-white tracking-wide mb-2">
          Cosmic Focus Mode
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Enter a distraction-free planetarium state to record focus minutes and expand your universe.
        </p>
      </div>

      <Card className="p-6 max-w-xl mx-auto border-purple-500/30">
        <div className="space-y-6">
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Select Subject Planet *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('');
                setSelectedGoalId('');
              }}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Goal */}
          {subjectGoals.length > 0 && (
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Link Goal Objective (Optional)
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500 font-mono text-xs"
              >
                <option value="">No goal linked</option>
                {subjectGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Select Topic */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
              Select Topic Star (Optional)
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full bg-[#141424] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">General Subject Study</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-2">
              Session Duration
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`py-2 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                    durationMinutes === m
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60 border border-purple-400/40'
                      : 'bg-[#10101a] text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Energy Projection */}
          <div className="bg-[#0c0c16] border border-white/10 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Projected Cosmic Energy</span>
            <span className="font-mono font-bold text-amber-400">+{durationMinutes} Energy</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleLaunch}
            icon={<Play className="w-5 h-5 fill-white" />}
            className="w-full font-bold"
          >
            Launch Focus Session
          </Button>
        </div>
      </Card>
    </div>
  );
};
