import { useMemo } from "react";
import { Card, SubjectBadge, EmptyState } from "../components";
import { useTasks, useSessions, useMarks } from "../hooks";
import { formatDate, formatDuration, getDaysUntilExam, isToday, isTomorrow } from "../utils";
import { EXAM_SCHEDULE, SUBJECTS } from "../types";
import type { SubjectStats } from "../types";
import styles from "./DashboardPage.module.css";

function DashboardPage(): React.ReactElement {
  const { tasks, toggleTask } = useTasks();
  const { sessions } = useSessions();
  const { getSubjectStats, overallAverage } = useMarks();

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.completed)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  const recentSessions = useMemo(() => {
    return [...sessions]
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .slice(0, 5);
  }, [sessions]);

  const nextExam = useMemo(() => {
    const today = new Date();
    return EXAM_SCHEDULE
      .filter((exam) => new Date(exam.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, []);

  const totalStudyMinutes = useMemo(() => {
    return sessions.reduce((total, session) => {
      const start = new Date(session.start).getTime();
      const end = new Date(session.end).getTime();
      return total + Math.round((end - start) / (1000 * 60));
    }, 0);
  }, [sessions]);

  const todayStudyMinutes = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return sessions
      .filter((s) => s.start.startsWith(today))
      .reduce((total, session) => {
        const start = new Date(session.start).getTime();
        const end = new Date(session.end).getTime();
        return total + Math.round((end - start) / (1000 * 60));
      }, 0);
  }, [sessions]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return {
      completedTasks,
      totalTasks,
      completionRate,
      avgMark: overallAverage,
      totalStudyTime: totalStudyMinutes,
      todayStudyTime: todayStudyMinutes,
    };
  }, [tasks, overallAverage, totalStudyMinutes, todayStudyMinutes]);

  const subjectProgress = useMemo(() => {
    const allStats = getSubjectStats();
    return allStats.filter((s: SubjectStats) => s.totalTests > 0);
  }, [getSubjectStats]);

  const formatTaskDue = (dateStr: string): string => {
    if (isToday(dateStr)) return "Today";
    if (isTomorrow(dateStr)) return "Tomorrow";
    return formatDate(dateStr);
  };

  const getSessionDuration = (start: string, end: string): number => {
    return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>Welcome to Study Planner</h1>
          <p>Track your G.C.E. O/L preparation progress</p>
        </div>
        {nextExam && (
          <Card className={styles.examCountdown}>
            <div className={styles.countdownContent}>
              <span className={styles.countdownLabel}>Days until exams</span>
              <span className={styles.countdownNumber}>{getDaysUntilExam()}</span>
              <span className={styles.nextExam}>
                Next: {nextExam.subject} ({formatDate(nextExam.date)})
              </span>
            </div>
          </Card>
        )}
      </header>

      <section className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completedTasks}/{stats.totalTasks}</span>
            <span className={styles.statLabel}>Tasks Completed</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatDuration(stats.todayStudyTime)}</span>
            <span className={styles.statLabel}>Today Study Time</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.avgMark}%</span>
            <span className={styles.statLabel}>Average Mark</span>
          </div>
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatDuration(stats.totalStudyTime)}</span>
            <span className={styles.statLabel}>Total Study Time</span>
          </div>
        </Card>
      </section>

      <div className={styles.contentGrid}>
        <Card className={styles.upcomingTasks}>
          <h2 className={styles.sectionTitle}>Upcoming Tasks</h2>
          {upcomingTasks.length > 0 ? (
            <ul className={styles.taskList}>
              {upcomingTasks.map((task) => (
                <li key={task.id} className={styles.taskItem}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <div className={styles.taskContent}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <div className={styles.taskMeta}>
                      <SubjectBadge subject={task.subject} size="sm" />
                      <span className={styles.taskDue}>{formatTaskDue(task.dueDate)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="clipboard" title="No upcoming tasks" description="Add tasks to get started!" />
          )}
        </Card>

        <Card className={styles.recentSessions}>
          <h2 className={styles.sectionTitle}>Recent Study Sessions</h2>
          {recentSessions.length > 0 ? (
            <ul className={styles.sessionList}>
              {recentSessions.map((session) => (
                <li key={session.id} className={styles.sessionItem}>
                  <SubjectBadge subject={session.subject} size="sm" />
                  <span className={styles.sessionTopic}>{session.title}</span>
                  <span className={styles.sessionDuration}>
                    {formatDuration(getSessionDuration(session.start, session.end))}
                  </span>
                  <span className={styles.sessionDate}>{formatDate(session.start)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="clock" title="No sessions yet" description="Start studying!" />
          )}
        </Card>

        <Card className={styles.subjectProgress}>
          <h2 className={styles.sectionTitle}>Subject Progress</h2>
          {subjectProgress.length > 0 ? (
            <div className={styles.subjectGrid}>
              {subjectProgress.map((stat: SubjectStats) => (
                <div key={stat.subject} className={styles.subjectCard}>
                  <SubjectBadge subject={stat.subject} size="sm" />
                  <div className={styles.subjectStats}>
                    <span className={styles.subjectAvg}>{stat.averageScore}%</span>
                    <span className={styles.subjectTests}>{stat.totalTests} tests</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="chart" title="No marks yet" description="Add marks!" />
          )}
        </Card>

        <Card className={styles.examSchedule}>
          <h2 className={styles.sectionTitle}>Exam Schedule</h2>
          <ul className={styles.examList}>
            {EXAM_SCHEDULE.slice(0, 6).map((exam) => (
              <li key={exam.subject} className={styles.examItem}>
                <SubjectBadge subject={exam.subject} size="sm" />
                <span className={styles.examDate}>{formatDate(exam.date)}</span>
                <span className={styles.examDays}>{getDaysUntilExam(exam.date)} days</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <footer className={styles.footer}>
        <p className={styles.motivational}>{SUBJECTS.length} subjects to master!</p>
      </footer>
    </div>
  );
}

export default DashboardPage;