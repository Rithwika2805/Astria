import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Minimize2, Maximize2, Check } from 'lucide-react';

export interface FocusNotesWidgetProps {
  notes: string;
  onNotesChange: (content: string) => void;
}

export type NotesState = 'EXPANDED' | 'COLLAPSED' | 'MINIMIZED';

export const FocusNotesWidget: React.FC<FocusNotesWidgetProps> = ({
  notes,
  onNotesChange,
}) => {
  const [widgetState, setWidgetState] = useState<NotesState>('EXPANDED');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(e.target.value);
    setIsSaved(false);
    setTimeout(() => setIsSaved(true), 800);
  };

  if (widgetState === 'MINIMIZED') {
    return (
      <button
        onClick={() => setWidgetState('EXPANDED')}
        title="Open Focus Notes"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-[#141426]/90 border border-purple-500/40 text-purple-300 shadow-2xl hover:bg-purple-950/60 hover:text-white transition-all cursor-pointer flex items-center gap-2"
      >
        <FileText className="w-5 h-5" />
        <span className="text-xs font-mono font-semibold hidden sm:inline">Notes</span>
      </button>
    );
  }

  if (widgetState === 'COLLAPSED') {
    return (
      <div className="w-full max-w-sm mx-auto bg-[#10101a]/95 border border-purple-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between text-xs">
        <button
          onClick={() => setWidgetState('EXPANDED')}
          className="flex items-center gap-2 text-slate-300 hover:text-white cursor-pointer"
        >
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="font-semibold font-mono">📝 Focus Notes</span>
          {notes && <span className="text-[10px] text-slate-500 truncate max-w-[140px]">({notes.slice(0, 20)}...)</span>}
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setWidgetState('EXPANDED')}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWidgetState('MINIMIZED')}
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-[#10101c]/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl space-y-2">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-400" />
          <span className="font-heading font-semibold text-xs text-white uppercase tracking-wider">
            Focus Notes
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            {isSaved ? (
              <>
                <Check className="w-3 h-3 text-teal-400" />
                <span>Saved</span>
              </>
            ) : (
              <span>Saving...</span>
            )}
          </span>

          <button
            onClick={() => setWidgetState('COLLAPSED')}
            title="Collapse Notes"
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWidgetState('MINIMIZED')}
            title="Minimize to Floating Button"
            className="p-1 text-slate-400 hover:text-white cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <textarea
        rows={4}
        value={notes}
        onChange={handleChange}
        placeholder="Write thoughts, formulas, key points, or reminders while studying..."
        className="w-full bg-[#161628] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none font-sans leading-relaxed"
      />
    </div>
  );
};
