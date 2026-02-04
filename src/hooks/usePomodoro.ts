/**
 * @fileoverview Pomodoro timer hook.
 * Provides timer state and controls.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PomodoroState, PomodoroConfig, PomodoroMode, Subject } from '../types';
import { POMODORO_PRESETS } from '../types';
import { notificationService } from '../services/notificationService';

/**
 * Default Pomodoro state
 */
const getDefaultState = (config: PomodoroConfig): PomodoroState => ({
  mode: 'focus',
  timeRemaining: config.focusDuration * 60,
  isRunning: false,
  sessionCount: 0,
  config,
  subject: undefined,
});

/**
 * Custom hook for Pomodoro timer
 * @param presetKey - Preset key ('25/5' or '50/10')
 * @returns Pomodoro state and controls
 */
export function usePomodoro(presetKey: '25/5' | '50/10' = '25/5') {
  const [config, setConfig] = useState<PomodoroConfig>(
    POMODORO_PRESETS[presetKey]
  );
  const [state, setState] = useState<PomodoroState>(() =>
    getDefaultState(config)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    // Create a simple beep sound using Web Audio API
    audioRef.current = new Audio(
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRw7j9Xql30sM4DX7pt9KzZ60OuefC40cczqpH8uNGi/5a6FMjRlt+G1jDYzXrTcupE5Mlqv2MKXPTBaqtPGoT8wVqbPyqVDL1KhzM+pRjBNoMnSrko='
    );
  }, []);

  /**
   * Play completion sound
   */
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, []);

  /**
   * Clear the timer interval
   */
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Handle timer completion
   */
  const handleTimerComplete = useCallback(() => {
    clearTimer();
    playSound();

    setState((prev) => {
      const newSessionCount =
        prev.mode === 'focus' ? prev.sessionCount + 1 : prev.sessionCount;

      // Determine next mode
      let nextMode: PomodoroMode;
      let nextDuration: number;

      if (prev.mode === 'focus') {
        // Check if it's time for a long break
        if (newSessionCount % prev.config.sessionsBeforeLongBreak === 0) {
          nextMode = 'longBreak';
          nextDuration = prev.config.longBreakDuration * 60;
        } else {
          nextMode = 'shortBreak';
          nextDuration = prev.config.shortBreakDuration * 60;
        }
      } else {
        // After any break, go back to focus
        nextMode = 'focus';
        nextDuration = prev.config.focusDuration * 60;
      }

      // Show notification
      notificationService.showPomodoro(prev.mode, newSessionCount);

      return {
        ...prev,
        mode: nextMode,
        timeRemaining: nextDuration,
        isRunning: false,
        sessionCount: newSessionCount,
      };
    });
  }, [clearTimer, playSound]);

  /**
   * Timer tick effect
   */
  useEffect(() => {
    if (state.isRunning && state.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            return prev; // Let handleTimerComplete handle this
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
    }

    return clearTimer;
  }, [state.isRunning, clearTimer]);

  /**
   * Check for timer completion
   */
  useEffect(() => {
    if (state.isRunning && state.timeRemaining <= 0) {
      handleTimerComplete();
    }
  }, [state.timeRemaining, state.isRunning, handleTimerComplete]);

  /**
   * Starts the timer
   */
  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  /**
   * Pauses the timer
   */
  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clearTimer]);

  /**
   * Resets the timer to current mode's duration
   */
  const reset = useCallback(() => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      timeRemaining:
        prev.mode === 'focus'
          ? prev.config.focusDuration * 60
          : prev.mode === 'shortBreak'
            ? prev.config.shortBreakDuration * 60
            : prev.config.longBreakDuration * 60,
      isRunning: false,
    }));
  }, [clearTimer]);

  /**
   * Fully resets the timer to initial state
   */
  const fullReset = useCallback(() => {
    clearTimer();
    setState(getDefaultState(config));
  }, [clearTimer, config]);

  /**
   * Skips to the next mode
   */
  const skip = useCallback(() => {
    handleTimerComplete();
  }, [handleTimerComplete]);

  /**
   * Sets the subject for tracking
   */
  const setSubject = useCallback((subject: Subject | undefined) => {
    setState((prev) => ({ ...prev, subject }));
  }, []);

  /**
   * Changes the preset
   */
  const changePreset = useCallback((newPresetKey: '25/5' | '50/10') => {
    const newConfig = POMODORO_PRESETS[newPresetKey];
    setConfig(newConfig);
    clearTimer();
    setState(getDefaultState(newConfig));
  }, [clearTimer]);

  /**
   * Calculates progress percentage
   */
  const progress = (() => {
    const totalDuration =
      state.mode === 'focus'
        ? state.config.focusDuration * 60
        : state.mode === 'shortBreak'
          ? state.config.shortBreakDuration * 60
          : state.config.longBreakDuration * 60;
    return ((totalDuration - state.timeRemaining) / totalDuration) * 100;
  })();

  /**
   * Formats time remaining as MM:SS
   */
  const formattedTime = (() => {
    const mins = Math.floor(state.timeRemaining / 60);
    const secs = state.timeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  })();

  return {
    state,
    config,
    progress,
    formattedTime,
    start,
    pause,
    reset,
    fullReset,
    skip,
    setSubject,
    changePreset,
    isRunning: state.isRunning,
    mode: state.mode,
    sessionCount: state.sessionCount,
    timeRemaining: state.timeRemaining,
  };
}

export default usePomodoro;
