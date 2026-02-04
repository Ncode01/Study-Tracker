import React from 'react';
import type { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { AnimatePresence } from 'framer-motion';

export interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAdd?: () => void;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
}: TaskListProps): React.ReactElement {
  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default TaskList;
