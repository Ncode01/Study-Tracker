import { useState, useMemo, useEffect, useRef } from "react";
import { PomodoroTimer } from "../components/timer/PomodoroTimer";
import { useSessions, usePomodoro } from "../hooks";
import { useGamification } from "../hooks/useGamification";
import { formatDuration } from "../utils";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy } from "lucide-react";

function TimerPage(): React.ReactElement {
  const [preset, setPreset] = useState<"25/5" | "50/10">("25/5");
  const { sessions } = useSessions();
  const pomodoro = usePomodoro(preset);
  const { addXP } = useGamification();
  const lastSessionCount = useRef(pomodoro.sessionCount);
  const [showXPToast, setShowXPToast] = useState(false);

  // Gamification Logic: Detect session completion
  useEffect(() => {
    if (pomodoro.sessionCount > lastSessionCount.current) {
      // Award XP based on preset duration (approx 1 XP per minute of focus)
      const earnedXP = preset === '25/5' ? 25 : 50;
      addXP(earnedXP);
      setShowXPToast(true);
      setTimeout(() => setShowXPToast(false), 3000);
      lastSessionCount.current = pomodoro.sessionCount;
    }
  }, [pomodoro.sessionCount, preset, addXP]);

  const handlePresetChange = (newPreset: "25/5" | "50/10") => {
    setPreset(newPreset);
    pomodoro.changePreset(newPreset);
  };

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter((s) => s.start.startsWith(today));
    const totalMinutes = todaySessions.reduce((total, session) => {
      const start = new Date(session.start).getTime();
      const end = new Date(session.end).getTime();
      return total + Math.round((end - start) / (1000 * 60));
    }, 0);
    return {
      sessions: todaySessions.length,
      minutes: totalMinutes,
    };
  }, [sessions]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative">
      {/* XP Notification Toast */}
      <AnimatePresence>
        {showXPToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-10 right-10 z-50 bg-accent text-accent-foreground px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border-2 border-yellow-400"
          >
            <div className="p-2 bg-yellow-400/20 rounded-full">
              <Trophy size={24} className="text-yellow-600 dark:text-yellow-300" />
            </div>
            <div>
              <h4 className="font-bold text-lg">Focus Session Complete!</h4>
              <p className="font-medium">You earned +{preset === '25/5' ? 25 : 50} XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Deep Focus
        </h1>
        <p className="text-muted-foreground">
          "The successful warrior is the average man, with laser-like focus." – Bruce Lee
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <PomodoroTimer
            formattedTime={pomodoro.formattedTime}
            progress={pomodoro.progress}
            mode={pomodoro.mode}
            isRunning={pomodoro.isRunning}
            sessionCount={pomodoro.sessionCount}
            subject={pomodoro.state.subject}
            preset={preset}
            onStart={pomodoro.start}
            onPause={pomodoro.pause}
            onReset={pomodoro.reset}
            onSkip={pomodoro.skip}
            onSubjectChange={pomodoro.setSubject}
            onPresetChange={handlePresetChange}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-card w-full p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Today's Focus</h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-muted-foreground text-sm">Sessions</span>
                  <span className="text-2xl font-bold">{pomodoro.sessionCount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, (pomodoro.sessionCount / 8) * 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Target: 8 sessions</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-muted-foreground text-sm">Total Time</span>
                  <span className="text-2xl font-bold">{formatDuration(todayStats.minutes)}</span>
                </div>
                {/* No bar for time, just value */}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-primary/20">
            <h4 className="font-bold text-primary-foreground mb-2 flex items-center gap-2">
              <Trophy size={16} />
              XP Rewards
            </h4>
            <ul className="text-sm text-primary-foreground/80 space-y-2">
              <li className="flex justify-between">
                <span>25m Focus</span>
                <span className="font-bold text-accent">+25 XP</span>
              </li>
              <li className="flex justify-between">
                <span>50m Focus</span>
                <span className="font-bold text-accent">+50 XP</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerPage;