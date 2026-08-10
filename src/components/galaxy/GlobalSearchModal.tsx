import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import type { Subject, Goal, Habit, StudyPlan, Achievement } from '../../types';
import { Search, Globe, Target, Repeat, Star, Calendar, Trophy } from 'lucide-react';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  subjects: Subject[];
  goals: Goal[];
  habits: Habit[];
  plans: StudyPlan[];
  achievements: Achievement[];
  onClose: () => void;
  onSelectSubject: (subjectId: string) => void;
  onLaunchFocus: (subjectId?: string, topicId?: string, duration?: number, goalId?: string, habitId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  subjects,
  goals,
  habits,
  plans,
  achievements,
  onClose,
  onSelectSubject,
  onLaunchFocus,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const q = query.toLowerCase().trim();

  const matchingSubjects = q ? subjects.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) : [];
  const matchingGoals = q ? goals.filter((g) => g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) : [];
  const matchingHabits = q ? habits.filter((h) => h.title.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q))) : [];

  const matchingTopics: { topicId: string; topicName: string; subjectId: string; subjectName: string }[] = [];
  if (q) {
    subjects.forEach((s) => {
      s.units.forEach((u) => {
        u.topics.forEach((t) => {
          if (t.name.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))) {
            matchingTopics.push({
              topicId: t.id,
              topicName: t.name,
              subjectId: s.id,
              subjectName: s.name,
            });
          }
        });
      });
    });
  }

  const matchingPlans = q ? plans.filter((p) => p.subjectName.toLowerCase().includes(q) || (p.topicName && p.topicName.toLowerCase().includes(q))) : [];
  const matchingAchievements = q ? achievements.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) : [];

  const hasResults =
    matchingSubjects.length > 0 ||
    matchingGoals.length > 0 ||
    matchingHabits.length > 0 ||
    matchingTopics.length > 0 ||
    matchingPlans.length > 0 ||
    matchingAchievements.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="pt-2 space-y-4">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search planets, goals, habits, topics, missions, achievements... (Ctrl+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#141424] border border-purple-500/40 rounded-2xl pl-12 pr-4 py-3 text-base text-white focus:outline-none focus:border-purple-400 shadow-xl"
            autoFocus
          />
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto space-y-4 pr-1">
          {!q ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              Type keywords to search across your academic universe.
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400 text-xs font-mono">
              No matching celestial objects found for "{query}".
            </div>
          ) : (
            <>
              {/* Subjects */}
              {matchingSubjects.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    Planet Worlds ({matchingSubjects.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingSubjects.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectSubject(s.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe className="w-4 h-4" style={{ color: s.color }} />
                          <span className="font-semibold text-sm text-white">{s.name}</span>
                        </div>
                        <span className="text-xs text-purple-300 font-mono">Open World →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Habits */}
              {matchingHabits.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-purple-400 mb-2">
                    Routines & Habits ({matchingHabits.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingHabits.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          if (h.subjectId) {
                            onLaunchFocus(h.subjectId, undefined, h.targetValue || 45, h.goalId, h.id);
                          }
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] hover:bg-purple-950/30 border border-purple-500/30 hover:border-purple-400 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Repeat className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-semibold text-sm text-white block">{h.title}</span>
                            <span className="text-xs text-slate-400">{h.frequency} routine</span>
                          </div>
                        </div>
                        <span className="text-xs text-purple-300 font-mono">Start Routine →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {matchingGoals.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    Goals & Objectives ({matchingGoals.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingGoals.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectSubject(g.subjectId);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Target className="w-4 h-4 text-amber-400" />
                          <span className="font-semibold text-sm text-white">{g.title}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{g.priority} Priority</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics */}
              {matchingTopics.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    Topic Stars ({matchingTopics.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingTopics.map((t) => (
                      <div
                        key={t.topicId}
                        onClick={() => {
                          onLaunchFocus(t.subjectId, t.topicId);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Star className="w-4 h-4 text-purple-400" />
                          <div>
                            <span className="font-semibold text-sm text-white block">{t.topicName}</span>
                            <span className="text-xs text-slate-400">{t.subjectName}</span>
                          </div>
                        </div>
                        <span className="text-xs text-purple-300 font-mono">Focus →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plans */}
              {matchingPlans.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    Missions ({matchingPlans.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingPlans.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onLaunchFocus(p.subjectId, p.topicId, p.duration, p.goalId, p.habitId);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] hover:bg-purple-950/30 border border-white/10 hover:border-purple-500/40 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="font-semibold text-sm text-white">
                            {p.topicName || p.subjectName} ({p.date})
                          </span>
                        </div>
                        <span className="text-xs text-blue-300 font-mono">Launch →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {matchingAchievements.length > 0 && (
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                    Achievements ({matchingAchievements.length})
                  </span>
                  <div className="space-y-1.5">
                    {matchingAchievements.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#10101c] border border-white/10"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          <div>
                            <span className="font-semibold text-sm text-white block">{a.title}</span>
                            <span className="text-xs text-slate-400">{a.description}</span>
                          </div>
                        </div>
                        <span className="text-xs text-amber-400 font-mono font-semibold">{a.rarity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
