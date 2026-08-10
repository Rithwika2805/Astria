import React, { useState, useEffect, useRef } from 'react';
import type { Subject, Topic, Goal, Habit } from '../../types';
import { ProgressionService } from '../../services/progression';
import { FocusGalaxyBackground } from './FocusGalaxyBackground';
import { FocusNotesWidget } from './FocusNotesWidget';
import { Button } from '../ui/Button';
import { Play, Pause, Square, Zap, Target, Repeat, Maximize, Minimize } from 'lucide-react';

export interface FocusTimerProps {
  subjects: Subject[];
  goals: Goal[];
  habits?: Habit[];
  initialSubjectId?: string;
  initialTopicId?: string;
  initialGoalId?: string;
  initialHabitId?: string;
  initialDuration?: number;
  onEndSession: (actualDurationMinutes: number, markCompleted: boolean, notes?: string) => void;
  onCancel: () => void;
}

const DURATION_PRESETS = [15, 25, 45, 60, 90];

export const FocusTimer: React.FC<FocusTimerProps> = ({
  subjects,
  goals,
  habits = [],
  initialSubjectId,
  initialTopicId,
  initialGoalId,
  initialHabitId,
  initialDuration = 45,
  onEndSession,
  onCancel,
}) => {
  const [selectedSubjectId] = useState<string>(
    initialSubjectId || (subjects[0]?.id || '')
  );
  const [selectedTopicId] = useState<string>(initialTopicId || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(initialDuration);

  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDuration * 60);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [markTopicDoneOnEnd, setMarkTopicDoneOnEnd] = useState<boolean>(false);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const availableTopics: Topic[] = selectedSubject
    ? selectedSubject.units.flatMap((u) => u.topics)
    : [];

  const selectedTopic = availableTopics.find((t) => t.id === selectedTopicId);
  const selectedGoal = goals.find((g) => g.id === initialGoalId);
  const selectedHabit = habits.find((h) => h.id === initialHabitId);

  const goalProgress = selectedGoal
    ? ProgressionService.calculateGoalProgress(selectedGoal, [], subjects)
    : null;

  const timerRef = useRef<any>(null);

  useEffect(() => {
    setSecondsRemaining(durationMinutes * 60);
    setElapsedSeconds(0);
  }, [durationMinutes]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            onEndSession(durationMinutes, markTopicDoneOnEnd, sessionNotes);
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, durationMinutes, markTopicDoneOnEnd, sessionNotes, onEndSession]);

  // Fullscreen API Listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  const togglePause = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleFinishEarly = () => {
    const actualMins = Math.max(1, Math.round(elapsedSeconds / 60));
    onEndSession(actualMins, markTopicDoneOnEnd, sessionNotes);
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDurationSecs = durationMinutes * 60;
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round(((totalDurationSecs - secondsRemaining) / totalDurationSecs) * 100))
  );

  const gainedEnergy = Math.floor(elapsedSeconds / 60);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#050509] flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto"
    >
      {/* 2D Galaxy Background Layer with Constellation Map */}
      <FocusGalaxyBackground
        subject={selectedSubject}
        currentTopicId={selectedTopicId}
      />

      {/* Translucent Backdrop Overlay for legible controls */}
      <div className="absolute inset-0 bg-[#050509]/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Header Selector Bar */}
      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping shrink-0" />
          <div>
            <h3 className="font-heading font-bold text-xl text-white tracking-wide">
              {selectedSubject?.name || 'Cosmic Focus Session'}
            </h3>
            {selectedTopic && <p className="text-sm font-semibold text-purple-300">{selectedTopic.name}</p>}

            {/* Linked Goal & Habit Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {selectedGoal && goalProgress && (
                <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎯 Goal: {selectedGoal.title} ({goalProgress.percentage}%)</span>
                </span>
              )}
              {selectedHabit && (
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 border border-purple-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                  <Repeat className="w-3.5 h-3.5 text-purple-400" />
                  <span>🔁 Habit: {selectedHabit.title}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            icon={isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          >
            {isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}
          </Button>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            Exit Focus Mode
          </Button>
        </div>
      </div>

      {/* Main Countdown & Notes Desktop Layout */}
      <div className="relative z-10 max-w-5xl mx-auto w-full my-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Timer Display Column */}
        <div className="lg:col-span-2 text-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="42%" stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="transparent" />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                stroke="url(#timerGrad)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray="264%"
                strokeDashoffset={`${264 - (264 * progressPct) / 100}%`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-bold font-mono tracking-tight text-white drop-shadow-[0_0_25px_rgba(168,85,247,0.6)]">
                {formatTime(secondsRemaining)}
              </span>

              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>+{gainedEnergy} Cosmic Energy</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
            {DURATION_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setDurationMinutes(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                  durationMinutes === m
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60 border border-purple-400/40'
                    : 'bg-[#10101a] text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {selectedTopic && (
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={markTopicDoneOnEnd}
                onChange={(e) => setMarkTopicDoneOnEnd(e.target.checked)}
                className="rounded accent-purple-500 w-4 h-4 cursor-pointer"
              />
              <span>Mark topic "{selectedTopic.name}" as Completed when ending</span>
            </label>
          )}

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              onClick={togglePause}
              icon={isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            >
              {isTimerRunning ? 'Pause' : 'Resume'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleFinishEarly}
              icon={<Square className="w-4 h-4 fill-white" />}
            >
              End Session
            </Button>
          </div>
        </div>

        {/* Focus Notes Widget Side Panel */}
        <div className="w-full">
          <FocusNotesWidget
            notes={sessionNotes}
            onNotesChange={setSessionNotes}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-slate-400/80">
        ✦ Deep binaural space soundscape active • Stay present in your universe.
      </div>
    </div>
  );
};
