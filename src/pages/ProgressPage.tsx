import { useState } from "react";
import { MarkForm, ProgressChart } from "../components";
import { StudyStats, ActivityHeatmap, SubjectMastery } from "../components/analytics";
import { DataExporter } from "../components/dashboard/DataExporter";
import { useMarks, useSessions, useTasks, useGamification } from "../hooks";
import type { CreateMarkData } from "../hooks/useMarks";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Clock } from "lucide-react";
import { GradientButton } from "../components/ui/GradientButton";
import { AnimatedCounter } from "../components/ui/AnimatedCounter";

function ProgressPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { marks, addMark, getSubjectStats, getChartData } = useMarks();
  const { sessions } = useSessions();
  const { tasks } = useTasks();
  const { currentStreak } = useGamification();

  const subjectStats = getSubjectStats();
  const chartData = getChartData();

  const handleAddMark = (data: CreateMarkData) => {
    addMark(data);
    setIsFormOpen(false);
  };

  // Calculate stats for StudyStats widget
  const totalStudyMinutes = sessions.reduce((total, session) => {
    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    return total + (end - start) / (1000 * 60);
  }, 0);
  const totalHours = Math.round(totalStudyMinutes / 60 * 10) / 10;

  const avgSessionLength = sessions.length > 0
    ? Math.round(totalStudyMinutes / sessions.length)
    : 0;

  // Derive top subject
  const topSubject = subjectStats.reduce((prev, current) =>
    (prev.averageScore > current.averageScore) ? prev : current
    , subjectStats[0] || { subject: 'None', averageScore: 0 }).subject;

  // Activity heatmap data computation
  const heatmapData = sessions.reduce((acc, session) => {
    const date = session.start.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Add task completions to heatmap
  tasks.forEach(task => {
    if (task.completed) {
      // Assuming tasks have a completedAt date? If not, we might use dueDate or skipped.
      // The Task type doesn't have completedAt. Let's rely on sessions for now or just today.
      // Actually, let's keep it simple with sessions for now.
    }
  });

  const transformedChartData = chartData.map(item => ({
    date: item.date,
    [item.subject]: item.score,
  }));

  // Transform subject stats for SubjectMastery (simulated trend/hours for now)
  const masteryData = subjectStats.map(stat => {
    // Calculate trend based on recent marks
    const subjectMarks = marks
      .filter(m => m.subject === stat.subject)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (subjectMarks.length >= 2) {
      const recent = subjectMarks.slice(0, 3).reduce((sum, m) => sum + (m.score / m.maxScore) * 100, 0) / Math.min(3, subjectMarks.length);
      const older = subjectMarks.slice(3, 6).reduce((sum, m) => sum + (m.score / m.maxScore) * 100, 0) / (Math.min(6, subjectMarks.length) - 3 || 1);

      if (recent > older + 5) trend = 'up';
      else if (recent < older - 5) trend = 'down';
    }

    return {
      subject: stat.subject,
      mastery: Math.round(stat.averageScore),
      trend,
      studyHours: Math.round(sessions.filter(s => s.subject === stat.subject).reduce((acc, s) => {
        return acc + (new Date(s.end).getTime() - new Date(s.start).getTime()) / (1000 * 60 * 60);
      }, 0)),
      testsCompleted: stat.totalTests
    };
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Detailed insights into your academic journey</p>
        </div>
        <div className="flex gap-2">
          <DataExporter />
          <GradientButton onClick={() => setIsFormOpen(true)} icon={<Plus size={20} />}>
            Add Mark
          </GradientButton>
        </div>
      </div>

      <StudyStats
        totalHours={totalHours}
        totalSessions={sessions.length}
        totalTasks={tasks.filter(t => t.completed).length}
        avgSessionLength={avgSessionLength}
        currentStreak={currentStreak}
        topSubject={topSubject}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-violet-400" size={20} />
            Performance History
          </h2>
          <div className="h-[300px]">
            {marks.length > 0 ? (
              <ProgressChart data={transformedChartData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp size={48} className="opacity-20 mb-4" />
                <p>No test data recorded</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl overflow-hidden">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock className="text-emerald-400" size={20} />
            Study Activity
          </h2>
          <div className="flex justify-center">
            <ActivityHeatmap data={heatmapData} />
          </div>
          <div className="mt-8 text-center">
            <div className="inline-block p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-muted-foreground text-sm uppercase tracking-wider font-bold">Total Sessions</p>
              <p className="text-3xl font-black text-emerald-400">
                <AnimatedCounter value={sessions.length} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-6">Subject Mastery</h2>
        <SubjectMastery data={masteryData} />
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Test Result</h2>
                <button onClick={() => setIsFormOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <MarkForm onSubmit={handleAddMark} onCancel={() => setIsFormOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProgressPage;