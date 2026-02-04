import { useMemo } from "react";
import { useGamification } from "../hooks/useGamification";
import { useTasks, useSessions, useMarks } from "../hooks";
import {
  formatDate,
  formatDuration,
  getDaysUntilExam
} from "../utils";
import { EXAM_SCHEDULE } from "../types";
import { StatCard, DailyQuests } from "../components/dashboard";
import {
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  Brain,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion } from "framer-motion";
// If SubjectBadge uses module css, it might look off, but we can fix later.

export default function DashboardPage() {
  const { tasks } = useTasks();
  const { sessions } = useSessions();
  const { overallAverage } = useMarks();
  const { level, xp } = useGamification();

  // Metrics Logic
  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.completed).length;

    // Calculate total study time
    const totalStudyMinutes = sessions.reduce((total, session) => {
      const start = new Date(session.start).getTime();
      const end = new Date(session.end).getTime();
      return total + Math.round((end - start) / (1000 * 60));
    }, 0);

    // Calculate today's study time
    const today = new Date().toISOString().split("T")[0];
    const todayStudyMinutes = sessions
      .filter((s) => s.start.startsWith(today))
      .reduce((total, session) => {
        const start = new Date(session.start).getTime();
        const end = new Date(session.end).getTime();
        return total + Math.round((end - start) / (1000 * 60));
      }, 0);

    return {
      completedTasks,
      totalStudyMinutes,
      todayStudyMinutes,
      avgMark: overallAverage
    };
  }, [tasks, sessions, overallAverage]);

  const upcomingExams = useMemo(() => {
    const today = new Date();
    return EXAM_SCHEDULE
      .filter((exam) => new Date(exam.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, []);

  const nextExam = upcomingExams[0];
  const daysToExam = nextExam ? getDaysUntilExam(nextExam.date) : 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-center justify-between bg-gradient-to-r from-violet-900/50 to-indigo-900/50 border border-primary/20 rounded-2xl p-8 shadow-lg"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Welcome back, Scholar!
          </h1>
          <p className="text-muted-foreground mt-2">
            You are currently <span className="text-accent font-bold">Level {level}</span> with <span className="text-primary font-bold">{xp} XP</span>.
            Keep pushing!
          </p>
        </div>

        {nextExam && (
          <div className="flex items-center gap-4 bg-background/50 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10">
            <div className="text-center">
              <span className="block text-4xl font-bold text-primary">{daysToExam}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Days Left</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="font-medium text-sm text-muted-foreground">Next Exam</p>
              <p className="font-bold text-lg">{nextExam.subject}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tasks Finished"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="secondary"
          delay={0.1}
        />
        <StatCard
          label="Study Time (Total)"
          value={formatDuration(stats.totalStudyMinutes)}
          icon={Clock}
          color="primary"
          delay={0.2}
        />
        <StatCard
          label="Study Time (Today)"
          value={formatDuration(stats.todayStudyMinutes)}
          icon={BookOpen}
          color="accent"
          delay={0.3}
        />
        <StatCard
          label="Average Mark"
          value={`${stats.avgMark}% `}
          icon={GraduationCap}
          color="pink"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} />
              Exam Schedule
            </h2>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {new Date(exam.date).getDate()}
                    </div>
                    <div>
                      <p className="font-bold">{exam.subject}</p>
                      <p className="text-sm text-muted-foreground">G.C.E O/L Examination</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-accent">
                      {getDaysUntilExam(exam.date)} days away
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(exam.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Suggestion/Motivation */}
          <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Brain className="text-emerald-500 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-emerald-100">Study Tip</h3>
                <p className="text-emerald-200/80 text-sm mt-1">
                  Consistent revision is key! Try to break your study sessions into 25-minute chunks using the Pomodoro timer for maximum retention.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Secondary Area */}
        <div className="space-y-6">
          <DailyQuests />

          {/* Mini Task List */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="text-muted-foreground" size={20} />
              Priorities
            </h3>
            <ul className="space-y-3">
              {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                <li key={task.id} className="text-sm flex gap-2 items-start opacity-80 hover:opacity-100 transition-opacity">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span className="line-clamp-2">{task.title}</span>
                </li>
              ))}
              {tasks.filter(t => !t.completed).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No pending tasks. Great job!</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}