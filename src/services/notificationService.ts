/**
 * @fileoverview Notification service for browser notifications.
 * Handles permission requests and notification scheduling.
 */

import type { ScheduledNotification } from '../types';
import { generateNotificationId } from '../utils';

/**
 * Check if notifications are supported
 * @returns True if Notification API is available
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 * @returns Permission status string
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

/**
 * Request notification permission from user
 * @returns Promise resolving to permission status
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.error('Notifications not supported in this browser');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Show a notification immediately
 * @param title - Notification title
 * @param options - Notification options
 * @returns Notification instance or null
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isNotificationSupported()) {
    console.error('Notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.error('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

/**
 * Show a session reminder notification
 * @param sessionTitle - Title of the study session
 * @param subject - Subject name
 * @param minutesBefore - Minutes until session starts
 */
export function showSessionReminder(
  sessionTitle: string,
  subject: string,
  minutesBefore: number
): void {
  showNotification(`Study Session Starting Soon`, {
    body: `${sessionTitle} (${subject}) starts in ${minutesBefore} minute${minutesBefore !== 1 ? 's' : ''}`,
    tag: 'session-reminder',
  });
}

/**
 * Show a task due reminder notification
 * @param taskTitle - Title of the task
 * @param subject - Subject name
 */
export function showTaskReminder(taskTitle: string, subject: string): void {
  showNotification(`Task Due Today`, {
    body: `${taskTitle} (${subject}) is due today`,
    tag: 'task-reminder',
  });
}

/**
 * Show a Pomodoro completion notification
 * @param mode - Current Pomodoro mode
 * @param sessionCount - Number of completed sessions
 */
export function showPomodoroNotification(
  mode: 'focus' | 'shortBreak' | 'longBreak',
  sessionCount: number
): void {
  const messages = {
    focus: {
      title: 'Focus Session Complete!',
      body: `Great job! You've completed ${sessionCount} session${sessionCount !== 1 ? 's' : ''}. Time for a break!`,
    },
    shortBreak: {
      title: 'Break Over',
      body: 'Ready to get back to studying?',
    },
    longBreak: {
      title: 'Long Break Over',
      body: 'Feeling refreshed? Time to continue studying!',
    },
  };

  const message = messages[mode];
  showNotification(message.title, {
    body: message.body,
    tag: 'pomodoro',
  });
}

// Store timeout IDs for scheduled notifications
const scheduledTimeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

/**
 * Schedule a notification for later
 * @param notification - Scheduled notification data
 * @returns Scheduled notification with ID
 */
export function scheduleNotification(
  notification: Omit<ScheduledNotification, 'id'>
): ScheduledNotification {
  const scheduled: ScheduledNotification = {
    ...notification,
    id: generateNotificationId(),
  };

  const scheduledTime = new Date(notification.scheduledFor).getTime();
  const now = Date.now();
  const delay = scheduledTime - now;

  if (delay > 0) {
    const timeoutId = setTimeout(() => {
      showNotification(scheduled.title, { body: scheduled.body });
      scheduledTimeouts.delete(scheduled.id);
    }, delay);
    scheduledTimeouts.set(scheduled.id, timeoutId);
  }

  return scheduled;
}

/**
 * Cancel a scheduled notification
 * @param notificationId - ID of notification to cancel
 * @returns True if cancelled, false if not found
 */
export function cancelScheduledNotification(notificationId: string): boolean {
  const timeoutId = scheduledTimeouts.get(notificationId);
  if (timeoutId) {
    clearTimeout(timeoutId);
    scheduledTimeouts.delete(notificationId);
    return true;
  }
  return false;
}

/**
 * Cancel all scheduled notifications
 */
export function cancelAllScheduledNotifications(): void {
  scheduledTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  scheduledTimeouts.clear();
}

/**
 * Notification service object with all operations
 */
export const notificationService = {
  isSupported: isNotificationSupported,
  getPermission: getNotificationPermission,
  requestPermission: requestNotificationPermission,
  show: showNotification,
  showSessionReminder,
  showTaskReminder,
  showPomodoro: showPomodoroNotification,
  schedule: scheduleNotification,
  cancel: cancelScheduledNotification,
  cancelAll: cancelAllScheduledNotifications,
};
