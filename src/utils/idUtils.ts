/**
 * @fileoverview ID generation utilities.
 * Provides unique identifier generation for all entities.
 */

/**
 * Generates a unique ID using timestamp and random string
 * @param prefix - Optional prefix for the ID
 * @returns Unique identifier string
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}-${randomStr}`;
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Generates a task ID
 * @returns Task ID with 'task' prefix
 */
export function generateTaskId(): string {
  return generateId('task');
}

/**
 * Generates a session ID
 * @returns Session ID with 'session' prefix
 */
export function generateSessionId(): string {
  return generateId('session');
}

/**
 * Generates a mark ID
 * @returns Mark ID with 'mark' prefix
 */
export function generateMarkId(): string {
  return generateId('mark');
}

/**
 * Generates a notification ID
 * @returns Notification ID with 'notif' prefix
 */
export function generateNotificationId(): string {
  return generateId('notif');
}

/**
 * Validates if a string is a valid ID format
 * @param id - ID to validate
 * @returns True if valid ID format
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  // Basic validation: should contain timestamp-random pattern
  return /^[a-z]+-[a-z0-9]+-[a-z0-9]+$/.test(id) || /^[a-z0-9]+-[a-z0-9]+$/.test(id);
}
