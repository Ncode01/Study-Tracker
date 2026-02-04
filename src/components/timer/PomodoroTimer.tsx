/**
 * @fileoverview Pomodoro timer display component.
 */

import React from 'react';
import type { PomodoroMode, Subject } from '../../types';
import { SUBJECTS, SUBJECT_COLORS } from '../../types';
import { Button, Select } from '../common';
import styles from './PomodoroTimer.module.css';

/**
 * Pomodoro timer props
 */
export interface PomodoroTimerProps {
  /** Formatted time string (MM:SS) */
  formattedTime: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current mode */
  mode: PomodoroMode;
  /** Is timer running */
  isRunning: boolean;
  /** Session count */
  sessionCount: number;
  /** Selected subject */
  subject?: Subject;
  /** Current preset */
  preset: '25/5' | '50/10';
  /** Start handler */
  onStart: () => void;
  /** Pause handler */
  onPause: () => void;
  /** Reset handler */
  onReset: () => void;
  /** Skip handler */
  onSkip: () => void;
  /** Subject change handler */
  onSubjectChange: (subject: Subject | undefined) => void;
  /** Preset change handler */
  onPresetChange: (preset: '25/5' | '50/10') => void;
}

/**
 * Mode display labels
 */
const MODE_LABELS: Record<PomodoroMode, string> = {
  focus: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

/**
 * Mode colors
 */
const MODE_COLORS: Record<PomodoroMode, string> = {
  focus: 'var(--color-primary)',
  shortBreak: 'var(--color-success)',
  longBreak: 'var(--color-info)',
};

/**
 * Pomodoro timer display component
 * @param props - Timer props
 * @returns Timer element
 */
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
}: PomodoroTimerProps): React.ReactElement {
  const modeColor = subject ? SUBJECT_COLORS[subject] : MODE_COLORS[mode];

  const subjectOptions = [
    { value: '', label: 'No subject' },
    ...SUBJECTS.map((s) => ({ value: s, label: s })),
  ];

  const presetOptions = [
    { value: '25/5', label: '25/5 (Classic)' },
    { value: '50/10', label: '50/10 (Extended)' },
  ];

  // Calculate circle properties
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={styles.container}>
      <div className={styles.presetSelector}>
        <Select
          options={presetOptions}
          value={preset}
          onChange={(val) => onPresetChange(val as '25/5' | '50/10')}
        />
      </div>

      <div className={styles.timerWrapper}>
        <svg className={styles.progressRing} viewBox="0 0 280 280">
          <circle
            className={styles.progressBackground}
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="8"
          />
          <circle
            className={styles.progressBar}
            cx="140"
            cy="140"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ stroke: modeColor }}
            transform="rotate(-90 140 140)"
          />
        </svg>
        <div className={styles.timerContent}>
          <span className={styles.modeLabel} style={{ color: modeColor }}>
            {MODE_LABELS[mode]}
          </span>
          <span className={styles.time}>{formattedTime}</span>
          <span className={styles.sessions}>
            Session {sessionCount + (mode === 'focus' ? 1 : 0)}
          </span>
        </div>
      </div>

      <div className={styles.subjectSelector}>
        <Select
          label="Studying"
          options={subjectOptions}
          value={subject || ''}
          onChange={(val) => onSubjectChange(val as Subject || undefined)}
        />
      </div>

      <div className={styles.controls}>
        {!isRunning ? (
          <Button onClick={onStart} size="lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start
          </Button>
        ) : (
          <Button onClick={onPause} size="lg" variant="secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            Pause
          </Button>
        )}
        <Button onClick={onReset} variant="outline" size="lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg">
          Skip
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </Button>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{sessionCount}</span>
          <span className={styles.statLabel}>Sessions completed</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {Math.round((sessionCount * (preset === '25/5' ? 25 : 50)) / 60 * 10) / 10}h
          </span>
          <span className={styles.statLabel}>Focus time today</span>
        </div>
      </div>
    </div>
  );
}

export default PomodoroTimer;
