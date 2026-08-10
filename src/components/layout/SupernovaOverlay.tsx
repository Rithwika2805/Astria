import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface SupernovaOverlayProps {
  milestone: { title: string; subtitle: string } | null;
  onClose: () => void;
}

export const SupernovaOverlay: React.FC<SupernovaOverlayProps> = ({ milestone, onClose }) => {
  if (!milestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 overflow-hidden">
        {/* Backdrop Darkening */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Supernova Energy Burst Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 2.5, 1], opacity: [0, 1, 0.8] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-amber-400 via-purple-600 to-indigo-600 blur-3xl pointer-events-none"
        />

        {/* Content Box */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative z-10 max-w-lg w-full bg-[#0e0e18]/90 border border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center overflow-hidden"
        >
          {/* Ambient Particles */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Supernova Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-amber-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-xl shadow-amber-500/30 animate-pulse">
            <Zap className="w-10 h-10 text-slate-950 fill-slate-950" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> SUPERNOVA EVENT
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-wide mb-3">
            {milestone.title}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
            {milestone.subtitle}
          </p>

          <Button variant="gold" size="lg" onClick={onClose} className="w-full font-bold">
            ✦ Continue Exploring
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
