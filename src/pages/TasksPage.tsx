import { useState, useMemo } from "react";
import { TaskList, TaskForm } from "../components/tasks";
import { useTasks } from "../hooks";
import { SUBJECTS } from "../types";
import type { Subject, Priority, Task } from "../types";
import type { CreateTaskData } from "../hooks/useTasks";
import { useGamification } from "../hooks/useGamification";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, Trophy } from "lucide-react";

function TasksPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<Subject | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [showCompleted, setShowCompleted] = useState(true);

  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useTasks();
  const { addXP } = useGamification();
  const [showXPToast, setShowXPToast] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (subjectFilter !== "all" && task.subject !== subjectFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (!showCompleted && task.completed) return false;
      return true;
    });
  }, [tasks, subjectFilter, priorityFilter, showCompleted]);

  const handleAddTask = (data: CreateTaskData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
      setEditingTask(null);
    } else {
      addTask(data);
    }
    setIsFormOpen(false);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      // Award XP for completing a task
      addXP(10);
      setShowXPToast(true);
      setTimeout(() => setShowXPToast(false), 3000);
    }
    toggleTask(taskId);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 relative pb-20">
      {/* XP Toast */}
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
              <h4 className="font-bold text-lg">Task Complete!</h4>
              <p className="font-medium">+10 XP</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            Tasks
          </h1>
          <div className="text-muted-foreground">
            Manage your study goals
          </div>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 text-muted-foreground mr-2">
          <Filter size={16} />
          <span className="text-sm font-medium">Filter</span>
        </div>

        <select
          className="bg-muted px-3 py-1.5 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value as Subject | "all")}
        >
          <option value="all">All Subjects</option>
          {SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        <select
          className="bg-muted px-3 py-1.5 rounded-lg text-sm border-none focus:ring-1 focus:ring-primary"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <label className="flex items-center gap-2 text-sm ml-auto cursor-pointer select-none">
          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${showCompleted ? 'bg-primary border-primary text-white' : 'border-muted-foreground'}`}>
            {showCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Plus size={14} className="rotate-45" strokeWidth={3} /></motion.div>}
          </div>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="hidden"
          />
          Show Completed
        </label>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm min-h-[400px]">
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <div className="bg-muted/50 p-6 rounded-full mb-4">
              <Trophy size={48} className="text-muted-foreground/50" />
            </div>
            <p className="font-medium text-lg">All caught up!</p>
            <p className="text-sm">No tasks match your filters.</p>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseForm}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
                  <h2 className="text-xl font-bold">{editingTask ? "Edit Task" : "New Task"}</h2>
                  <button onClick={handleCloseForm} className="text-muted-foreground hover:text-foreground">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>
                <div className="p-6">
                  <TaskForm
                    onSubmit={handleAddTask}
                    onCancel={handleCloseForm}
                    task={editingTask}
                  />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TasksPage;