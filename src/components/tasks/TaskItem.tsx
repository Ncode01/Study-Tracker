import type { Task } from '../../types';
import { SUBJECT_COLORS } from '../../types';
import { formatDate } from '../../utils';
import { motion } from 'framer-motion';
import { Check, Edit, Trash2, Calendar, Repeat } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps): React.ReactElement {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  const priorityColors = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        task.completed ? "bg-muted/30 border-border" : "bg-card border-border hover:border-primary/50 hover:shadow-md"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          task.completed
            ? "bg-primary border-primary text-primary-foreground"
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {task.completed && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "font-medium truncate transition-all",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: SUBJECT_COLORS[task.subject] }}
            title={task.subject}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className={cn("flex items-center gap-1", isOverdue && "text-red-500 font-bold")}>
            <Calendar size={12} />
            {formatDate(task.dueDate)}
          </span>

          {task.recurrence !== 'none' && (
            <span className="flex items-center gap-1 text-primary">
              <Repeat size={12} />
              {task.recurrence}
            </span>
          )}

          <span className={cn("px-1.5 py-0.5 rounded text-[10px] border uppercase tracking-wider", priorityColors[task.priority])}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

export default TaskItem;
