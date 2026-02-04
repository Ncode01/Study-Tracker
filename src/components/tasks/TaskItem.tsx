/**
 * @fileoverview Task item component.
 */

import React from 'react';
import type { Task } from '../../types';
import { SubjectBadge } from '../common';
import { formatDate } from '../../utils';
import styles from './TaskItem.module.css';

/**
 * Task item props
 */
export interface TaskItemProps {
  /** Task data */
  task: Task;
  /** Toggle completion handler */
  onToggle: (taskId: string) => void;
  /** Edit handler */
  onEdit: (task: Task) => void;
  /** Delete handler */
  onDelete: (taskId: string) => void;
}

/**
 * Individual task item component
 * @param props - Task item props
 * @returns Task item element
 */
export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
}: TaskItemProps): React.ReactElement {
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  return (
    <div className={`${styles.item} ${task.completed ? styles.completed : ''} ${isOverdue ? styles.overdue : ''}`}>
      <div className={styles.checkbox}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          id={`task-${task.id}`}
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <label htmlFor={`task-${task.id}`} className={styles.checkmark}>
          {task.completed && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </label>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{task.title}</span>
          {task.recurrence !== 'none' && (
            <span className={styles.recurrence} title={`Repeats ${task.recurrence}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </span>
          )}
        </div>
        <div className={styles.meta}>
          <SubjectBadge subject={task.subject} size="sm" />
          <span className={styles.dueDate}>
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {formatDate(task.dueDate, 'MMM d')}
          </span>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
