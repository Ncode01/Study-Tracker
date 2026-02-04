
import type { PomodoroMode, Subject } from '../../types';
import { SUBJECTS, SUBJECT_COLORS } from '../../types';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Clock, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface PomodoroTimerProps {
  formattedTime: string;
  progress: number;
  mode: PomodoroMode;
  isRunning: boolean;
  sessionCount: number;
  subject?: Subject;
  preset: '25/5' | '50/10';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSubjectChange: (subject: Subject | undefined) => void;
  onPresetChange: (preset: '25/5' | '50/10') => void;
}

const MODE_COLORS: Record<PomodoroMode, string> = {
  focus: '#8b5cf6', // Primary (Violet)
  shortBreak: '#10b981', // Emerald
  longBreak: '#f59e0b', // Amber
};

const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export function PomodoroTimer({
  formattedTime,
  progress,
  mode,
  isRunning,
  sessionCount,
  subject,
  preset,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSubjectChange,
  onPresetChange,
}: PomodoroTimerProps) {
  const modeColor = subject ? SUBJECT_COLORS[subject] : MODE_COLORS[mode];

  // Circle config
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 bg-card border border-border rounded-2xl shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-0 left-0 w-full h-full opacity-10 blur-3xl pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: modeColor }}
      />

      {/* Preset Toggle */}
      <div className="flex bg-muted p-1 rounded-lg mb-8 relative z-10">
        {(['25/5', '50/10'] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPresetChange(p)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
              preset === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p === '25/5' ? 'Classic' : 'Long'}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8 z-10">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={modeColor}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "linear" }}
            className="drop-shadow-[0_0_10px_rgba(0,0,0,0.2)] transition-colors duration-500"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm uppercase tracking-widest font-bold mb-2 transition-colors duration-500"
            style={{ color: modeColor }}
          >
            {MODE_LABELS[mode]}
          </motion.div>

          <div className="text-6xl font-black font-mono tracking-tighter tabular-nums mb-2">
            {formattedTime}
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium bg-muted/50 px-3 py-1 rounded-full">
            <Clock size={14} />
            <span>Session {sessionCount + (mode === 'focus' ? 1 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8 z-10">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
          >
            <Play size={32} className="ml-1" fill="currentColor" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPause}
            className="h-16 w-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg shadow-secondary/25 hover:bg-secondary/90 transition-colors"
          >
            <Pause size={32} fill="currentColor" />
          </motion.button>
        )}

        <button
          onClick={onReset}
          className="h-12 w-12 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground flex items-center justify-center transition-colors"
          title="Reset Timer"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={onSkip}
          className="h-12 w-12 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground flex items-center justify-center transition-colors"
          title="Skip Phase"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Subject Selector */}
      <div className="w-full relative z-10">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block text-center">
          Focusing On
        </label>
        <div className="relative">
          <select
            value={subject || ''}
            onChange={(e) => onSubjectChange(e.target.value as Subject || undefined)}
            className="w-full appearance-none bg-muted hover:bg-muted/80 transition-colors px-4 py-3 rounded-xl text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
          >
            <option value="">General Study</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <BookOpen size={16} />
          </div>
        </div>
      </div>

    </div>
  );
}
