/**
 * @fileoverview Generic localStorage hook for reactive state management.
 * Provides a useState-like interface backed by localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../services/storageService';
import type { StorageKey } from '../services/storageService';

/**
 * Custom hook for managing state persisted in localStorage
 * @template T - Type of the stored value
 * @param key - Storage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns Tuple of [value, setValue] similar to useState
 */
export function useLocalStorage<T>(
  key: StorageKey,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem<T>(key, defaultValue);
  });

  /**
   * Updates both state and localStorage
   * @param value - New value or updater function
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        setStorageItem(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {
          console.error('Error parsing storage event value');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
