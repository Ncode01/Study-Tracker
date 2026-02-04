import { useState, useMemo } from "react";
import { Button, Modal, Card, EmptyState } from "../components";
import { TaskList, TaskForm } from "../components";
import { useTasks } from "../hooks";
import { SUBJECTS } from "../types";
import type { Subject, Priority, Task } from "../types";
import type { CreateTaskData } from "../hooks/useTasks";
import styles from "./TasksPage.module.css";

function TasksPage(): React.ReactElement {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<Subject | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [showCompleted, setShowCompleted] = useState(true);
  
  const { tasks, addTask, toggleTask, deleteTask, updateTask } = useTasks();

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

  return (
    <div className={styles.tasksPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tasks</h1>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value as Subject | "all")}
          >
            <option value="all">All Subjects</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            Show completed
          </label>
          <Button onClick={() => setIsFormOpen(true)}>Add Task</Button>
        </div>
      </header>

      <div className={styles.taskListContainer}>
        {filteredTasks.length > 0 ? (
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onEdit={handleEditTask}
            onDelete={deleteTask}
          />
        ) : (
          <Card>
            <EmptyState
              icon="clipboard"
              title="No tasks found"
              description="Add a task or adjust your filters."
            />
          </Card>
        )}
      </div>

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingTask ? "Edit Task" : "Add Task"}>
        <TaskForm 
          onSubmit={handleAddTask} 
          onCancel={handleCloseForm}
          task={editingTask}
        />
      </Modal>
    </div>
  );
}

export default TasksPage;