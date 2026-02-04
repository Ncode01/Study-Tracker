/**
 * @fileoverview Browser notifications hook.
 * Handles permission requests and notification management.
 */

import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

/**
 * Custom hook for browser notifications
 * @returns Notification state and controls
 */
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermission()
  );
  const [isSupported] = useState<boolean>(notificationService.isSupported());

  /**
   * Update permission state on mount
   */
  useEffect(() => {
    setPermission(notificationService.getPermission());
  }, []);

  /**
   * Request notification permission
   * @returns New permission status
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  /**
   * Show a notification
   * @param title - Notification title
   * @param body - Notification body
   */
  const showNotification = useCallback(
    (title: string, body: string): void => {
      if (permission === 'granted') {
        notificationService.show(title, { body });
      }
    },
    [permission]
  );

  /**
   * Show session reminder
   * @param sessionTitle - Session title
   * @param subject - Subject name
   * @param minutesBefore - Minutes until session
   */
  const showSessionReminder = useCallback(
    (sessionTitle: string, subject: string, minutesBefore: number): void => {
      if (permission === 'granted') {
        notificationService.showSessionReminder(
          sessionTitle,
          subject,
          minutesBefore
        );
      }
    },
    [permission]
  );

  /**
   * Show task reminder
   * @param taskTitle - Task title
   * @param subject - Subject name
   */
  const showTaskReminder = useCallback(
    (taskTitle: string, subject: string): void => {
      if (permission === 'granted') {
        notificationService.showTaskReminder(taskTitle, subject);
      }
    },
    [permission]
  );

  /**
   * Check if notifications can be shown
   */
  const canNotify = permission === 'granted' && isSupported;

  /**
   * Check if permission needs to be requested
   */
  const needsPermission = permission === 'default' && isSupported;

  return {
    permission,
    isSupported,
    canNotify,
    needsPermission,
    requestPermission,
    showNotification,
    showSessionReminder,
    showTaskReminder,
  };
}

export default useNotifications;
