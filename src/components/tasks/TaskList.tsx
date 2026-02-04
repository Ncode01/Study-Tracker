/**
 * @fileoverview Task list component.
 */

import React from 'react';
import type { Task } from '../../types';
import { TaskItem } from './TaskItem';
import { EmptyState, Button } from '../common';
import styles from './TaskList.module.css';

/**
 * Task list props
 */
export interface TaskListProps {
  /** Array of tasks */
  tasks: Task[];
  /** Toggle completion handler */
  onToggle: (taskId: string) => void;
  /** Edit handler */
  onEdit: (task: Task) => void;
  /** Delete handler */
  onDelete: (taskId: string) => void;
  /** Add new task handler */
  onAdd?: () => void;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Task list component
 * @param props - Task list props
 * @returns Task list element
 */
export function TaskList({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  emptyMessage = 'No tasks yet',
}: TaskListProps): React.ReactElement {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description="Create your first task to get started with your study plan."
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        }
        action={
          onAdd && (
            <Button onClick={onAdd}>Add Task</Button>
          )
        }
      />
    );
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
