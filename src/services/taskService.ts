/**
 * @fileoverview Task service for managing task persistence.
 * Handles CRUD operations and recurring task logic.
 */

import type { Task, Subject } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';
import { generateTaskId, getCurrentISOString, addDaysToDate, addWeeksToDate, isDateBefore, getToday } from '../utils';

/**
 * Gets all tasks from storage
 * @returns Array of tasks
 */
export function getAllTasks(): Task[] {
  return getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
}

/**
 * Gets tasks filtered by subject
 * @param subject - Subject to filter by
 * @returns Filtered tasks
 */
export function getTasksBySubject(subject: Subject): Task[] {
  const tasks = getAllTasks();
  return tasks.filter((task) => task.subject === subject);
}

/**
 * Gets incomplete tasks
 * @returns Array of incomplete tasks
 */
export function getIncompleteTasks(): Task[] {
  const tasks = getAllTasks();
  return tasks.filter((task) => !task.completed);
}

/**
 * Gets tasks due today
 * @returns Array of tasks due today
 */
export function getTasksDueToday(): Task[] {
  const tasks = getAllTasks();
  const today = new Date().toISOString().split('T')[0];
  return tasks.filter(
    (task) => !task.completed && task.dueDate.startsWith(today)
  );
}

/**
 * Gets overdue tasks
 * @returns Array of overdue tasks
 */
export function getOverdueTasks(): Task[] {
  const tasks = getAllTasks();
  const today = getToday();
  return tasks.filter(
    (task) => !task.completed && isDateBefore(task.dueDate, today.toISOString())
  );
}

/**
 * Creates a new task
 * @param taskData - Task data without id and timestamps
 * @returns Created task
 */
export function createTask(
  taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>
): Task {
  const tasks = getAllTasks();
  const newTask: Task = {
    ...taskData,
    id: generateTaskId(),
    completed: false,
    createdAt: getCurrentISOString(),
  };
  tasks.push(newTask);
  setStorageItem(STORAGE_KEYS.TASKS, tasks);
  return newTask;
}

/**
 * Updates an existing task
 * @param taskId - ID of task to update
 * @param updates - Partial task updates
 * @returns Updated task or null if not found
 */
export function updateTask(
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt'>>
): Task | null {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    console.error(`Task not found: ${taskId}`);
    return null;
  }
  tasks[index] = { ...tasks[index], ...updates };
  setStorageItem(STORAGE_KEYS.TASKS, tasks);
  return tasks[index];
}

/**
 * Toggles task completion status
 * @param taskId - ID of task to toggle
 * @returns Updated task or null if not found
 */
export function toggleTaskCompletion(taskId: string): Task | null {
  const tasks = getAllTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    console.error(`Task not found: ${taskId}`);
    return null;
  }

  const wasCompleted = task.completed;
  task.completed = !wasCompleted;

  // If completing a recurring task, record completion time
  if (!wasCompleted && task.recurrence !== 'none') {
    task.lastCompletedAt = getCurrentISOString();
  }

  setStorageItem(STORAGE_KEYS.TASKS, tasks);

  // If completing a recurring task, create the next occurrence
  if (!wasCompleted && task.recurrence !== 'none') {
    createNextRecurringTask(task);
  }

  return task;
}

/**
 * Creates the next occurrence of a recurring task
 * @param task - The recurring task
 * @returns New task instance
 */
function createNextRecurringTask(task: Task): Task {
  const nextDueDate =
    task.recurrence === 'daily'
      ? addDaysToDate(task.dueDate, 1)
      : addWeeksToDate(task.dueDate, 1);

  const newTask: Task = {
    ...task,
    id: generateTaskId(),
    completed: false,
    dueDate: nextDueDate.toISOString(),
    createdAt: getCurrentISOString(),
    originalTaskId: task.originalTaskId || task.id,
    lastCompletedAt: undefined,
  };

  const tasks = getAllTasks();
  tasks.push(newTask);
  setStorageItem(STORAGE_KEYS.TASKS, tasks);
  return newTask;
}

/**
 * Deletes a task
 * @param taskId - ID of task to delete
 * @returns True if deleted, false if not found
 */
export function deleteTask(taskId: string): boolean {
  const tasks = getAllTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index === -1) {
    console.error(`Task not found: ${taskId}`);
    return false;
  }
  tasks.splice(index, 1);
  setStorageItem(STORAGE_KEYS.TASKS, tasks);
  return true;
}

/**
 * Deletes all tasks for a subject
 * @param subject - Subject to clear tasks for
 * @returns Number of deleted tasks
 */
export function deleteTasksBySubject(subject: Subject): number {
  const tasks = getAllTasks();
  const filtered = tasks.filter((t) => t.subject !== subject);
  const deletedCount = tasks.length - filtered.length;
  setStorageItem(STORAGE_KEYS.TASKS, filtered);
  return deletedCount;
}

/**
 * Gets task statistics
 * @returns Task statistics object
 */
export function getTaskStats(): {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  bySubject: Record<Subject, { total: number; completed: number }>;
} {
  const tasks = getAllTasks();
  const today = getToday();
  const overdue = tasks.filter(
    (t) => !t.completed && isDateBefore(t.dueDate, today.toISOString())
  ).length;

  const bySubject: Record<Subject, { total: number; completed: number }> = {
    Mathematics: { total: 0, completed: 0 },
    Science: { total: 0, completed: 0 },
    Sinhala: { total: 0, completed: 0 },
    English: { total: 0, completed: 0 },
    History: { total: 0, completed: 0 },
    Buddhism: { total: 0, completed: 0 },
  };

  tasks.forEach((task) => {
    bySubject[task.subject].total++;
    if (task.completed) {
      bySubject[task.subject].completed++;
    }
  });

  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    overdue,
    bySubject,
  };
}

/**
 * Task service object with all operations
 */
export const taskService = {
  getAll: getAllTasks,
  getBySubject: getTasksBySubject,
  getIncomplete: getIncompleteTasks,
  getDueToday: getTasksDueToday,
  getOverdue: getOverdueTasks,
  create: createTask,
  update: updateTask,
  toggleCompletion: toggleTaskCompletion,
  delete: deleteTask,
  deleteBySubject: deleteTasksBySubject,
  getStats: getTaskStats,
};
