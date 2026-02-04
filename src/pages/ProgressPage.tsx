import { useState } from "react";
import { MarkForm, ProgressChart, SubjectStatsCard } from "../components";
import { useMarks, useSessions } from "../hooks";
import { SUBJECTS } from "../types";
import type { CreateMarkData } from "../hooks/useMarks";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, TrendingUp, Clock, BookOpen, Plus } from "lucide-react";

function ProgressPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { marks, addMark, overallAverage, getSubjectStats, getChartData } = useMarks();
  const { sessions } = useSessions();

  const subjectStats = getSubjectStats();
  const chartData = getChartData();

  const handleAddMark = (data: CreateMarkData) => {
    addMark(data);
    setIsFormOpen(false);
  };

  const totalStudyHours = sessions.reduce((total, session) => {
    const start = new Date(session.start).getTime();
    const end = new Date(session.end).getTime();
    return total + (end - start) / (1000 * 60 * 60);
  }, 0);

  const transformedChartData = chartData.map(item => ({
    date: item.date,
    [item.subject]: item.score,
  }));

  const StatBox = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Progress Tracking
          </h1>
          <p className="text-muted-foreground">Visualize your academic growth</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Add Mark
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Overall Avg" value={`${overallAverage}%`} icon={PieChart} color="bg-blue-500/10 text-blue-500" />
        <StatBox label="Tests Taken" value={marks.length} icon={TrendingUp} color="bg-green-500/10 text-green-500" />
        <StatBox label="Study Hours" value={`${totalStudyHours.toFixed(1)}h`} icon={Clock} color="bg-orange-500/10 text-orange-500" />
        <StatBox label="Subjects" value={SUBJECTS.length} icon={BookOpen} color="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Performance Trend</h2>
        <div className="h-[300px]">
          {marks.length > 0 ? (
            <ProgressChart data={transformedChartData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <TrendingUp size={48} className="opacity-20 mb-4" />
              <p>No data available yet</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">Subject Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectStats.map((stat) => (
            <SubjectStatsCard key={stat.subject} stats={stat} />
            // Note: SubjectStatsCard needs to be checked if it uses modules. 
            // If so, it might look odd but container is clean.
            // Ideally we'd replace SubjectStatsCard in place too, but for time constraint we keep it wrapped.
          ))}
        </div>
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-lg rounded-xl border border-border shadow-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Add Test Result</h2>
                <button onClick={() => setIsFormOpen(false)}><Plus className="rotate-45" /></button>
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