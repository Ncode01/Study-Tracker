/**
 * @fileoverview Task management hook.
 * Provides reactive task state and operations.
 */

import { useState, useCallback, useEffect } from 'react';
import type { Task, Subject, RecurrenceType, Priority } from '../types';
import { taskService } from '../services/taskService';

/**
 * Task creation data
 */
export interface CreateTaskData {
  title: string;
  subject: Subject;
  dueDate: string;
  recurrence?: RecurrenceType;
  priority?: Priority;
}

/**
 * Task update data
 */
export interface UpdateTaskData {
  title?: string;
  subject?: Subject;
  dueDate?: string;
  recurrence?: RecurrenceType;
  priority?: Priority;
  completed?: boolean;
}

/**
 * Custom hook for task management
 * @returns Task state and operations
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads tasks from storage
   */
  const loadTasks = useCallback(() => {
    try {
      setLoading(true);
      const loadedTasks = taskService.getAll();
      setTasks(loadedTasks);
      setError(null);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /**
   * Creates a new task
   * @param data - Task creation data
   * @returns Created task
   */
  const addTask = useCallback((data: CreateTaskData): Task => {
    const newTask = taskService.create({
      title: data.title,
      subject: data.subject,
      dueDate: data.dueDate,
      recurrence: data.recurrence || 'none',
      priority: data.priority || 'medium',
    });
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  }, []);

  /**
   * Updates an existing task
   * @param taskId - ID of task to update
   * @param updates - Partial updates
   * @returns Updated task or null
   */
  const updateTask = useCallback(
    (taskId: string, updates: UpdateTaskData): Task | null => {
      const updatedTask = taskService.update(taskId, updates);
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? updatedTask : t))
        );
      }
      return updatedTask;
    },
    []
  );

  /**
   * Toggles task completion
   * @param taskId - ID of task to toggle
   * @returns Updated task or null
   */
  const toggleTask = useCallback((taskId: string): Task | null => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return null;

    const updatedTask = taskService.toggleCompletion(taskId);
    if (updatedTask) {
      // Reload tasks to get any new recurring task instances
      loadTasks();
    }
    return updatedTask;
  }, [tasks, loadTasks]);

  /**
   * Deletes a task
   * @param taskId - ID of task to delete
   * @returns True if deleted
   */
  const deleteTask = useCallback((taskId: string): boolean => {
    const success = taskService.delete(taskId);
    if (success) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
    return success;
  }, []);

  /**
   * Gets tasks by subject
   * @param subject - Subject to filter by
   * @returns Filtered tasks
   */
  const getTasksBySubject = useCallback(
    (subject: Subject): Task[] => {
      return tasks.filter((t) => t.subject === subject);
    },
    [tasks]
  );

  /**
   * Gets incomplete tasks
   * @returns Incomplete tasks
   */
  const getIncompleteTasks = useCallback((): Task[] => {
    return tasks.filter((t) => !t.completed);
  }, [tasks]);

  /**
   * Gets tasks due today
   * @returns Tasks due today
   */
  const getTasksDueToday = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(
      (t) => !t.completed && t.dueDate.startsWith(today)
    );
  }, [tasks]);

  /**
   * Gets overdue tasks
   * @returns Overdue tasks
   */
  const getOverdueTasks = useCallback((): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(
      (t) => !t.completed && t.dueDate < today
    );
  }, [tasks]);

  /**
   * Gets task statistics
   * @returns Task stats
   */
  const getStats = useCallback(() => {
    return taskService.getStats();
  }, []);

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    getTasksBySubject,
    getIncompleteTasks,
    getTasksDueToday,
    getOverdueTasks,
    getStats,
    refresh: loadTasks,
  };
}

export default useTasks;
