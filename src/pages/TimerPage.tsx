import { useState, useMemo } from "react";
import { Card } from "../components";
import { PomodoroTimer } from "../components";
import { useSessions, usePomodoro } from "../hooks";
import { formatDuration } from "../utils";
import styles from "./TimerPage.module.css";

function TimerPage(): React.ReactElement {
  const [preset, setPreset] = useState<"25/5" | "50/10">("25/5");
  const { sessions } = useSessions();
  const pomodoro = usePomodoro(preset);

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

  const handlePresetChange = (newPreset: "25/5" | "50/10") => {
    setPreset(newPreset);
    pomodoro.changePreset(newPreset);
  };

  return (
    <div className={styles.timerPage}>
      <div className={styles.timerContainer}>
        <header className={styles.header}>
          <h1 className={styles.title}>Focus Timer</h1>
          <p className={styles.subtitle}>Use Pomodoro technique to stay focused</p>
        </header>

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

        <div className={styles.statsSection}>
          <Card className={styles.statCard}>
            <span className={styles.statValue}>{pomodoro.sessionCount}</span>
            <span className={styles.statLabel}>Pomodoros Today</span>
          </Card>
          <Card className={styles.statCard}>
            <span className={styles.statValue}>{todayStats.sessions}</span>
            <span className={styles.statLabel}>Study Sessions</span>
          </Card>
          <Card className={styles.statCard}>
            <span className={styles.statValue}>{formatDuration(todayStats.minutes)}</span>
            <span className={styles.statLabel}>Time Studied</span>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default TimerPage;