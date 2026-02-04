/**
 * @fileoverview Base storage service for localStorage operations.
 * Provides type-safe localStorage access with error handling.
 */

/**
 * Storage keys used in the application
 */
export const STORAGE_KEYS = {
  TASKS: 'study-planner-tasks',
  SESSIONS: 'study-planner-sessions',
  MARKS: 'study-planner-marks',
  POMODORO_STATE: 'study-planner-pomodoro',
  NOTIFICATIONS: 'study-planner-notifications',
  SETTINGS: 'study-planner-settings',
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Gets an item from localStorage with type safety
 * @template T - Expected type of the stored data
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Parsed value or default
 */
export function getStorageItem<T>(key: StorageKey, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Sets an item in localStorage with type safety
 * @template T - Type of the data to store
 * @param key - Storage key
 * @param value - Value to store
 * @returns True if successful, false otherwise
 */
export function setStorageItem<T>(key: StorageKey, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Removes an item from localStorage
 * @param key - Storage key
 * @returns True if successful, false otherwise
 */
export function removeStorageItem(key: StorageKey): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clears all application data from localStorage
 * @returns True if successful, false otherwise
 */
export function clearAllStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Checks if localStorage is available
 * @returns True if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
