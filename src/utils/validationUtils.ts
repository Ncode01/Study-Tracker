/**
 * @fileoverview Validation utilities for forms and data.
 * Provides validation functions for all entity types.
 */

import type {
  Task,
  StudySession,
  Mark,
  Subject,
  ValidationResult,
  RecurrenceType,
  Priority,
} from '../types';
import { SUBJECTS } from '../types';
import { parseDateString, isDateBefore, isDateAfter } from './dateUtils';

/**
 * Validates a subject
 * @param subject - Subject to validate
 * @returns True if valid subject
 */
export function isValidSubject(subject: string): subject is Subject {
  return SUBJECTS.includes(subject as Subject);
}

/**
 * Validates a recurrence type
 * @param recurrence - Recurrence type to validate
 * @returns True if valid recurrence
 */
export function isValidRecurrence(recurrence: string): recurrence is RecurrenceType {
  return ['none', 'daily', 'weekly'].includes(recurrence);
}

/**
 * Validates a priority
 * @param priority - Priority to validate
 * @returns True if valid priority
 */
export function isValidPriority(priority: string): priority is Priority {
  return ['low', 'medium', 'high'].includes(priority);
}

/**
 * Validates task form data
 * @param data - Partial task data to validate
 * @returns Validation result with errors
 */
export function validateTask(
  data: Partial<Task>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Task title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Task title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Task title must be less than 100 characters';
  }

  // Subject validation
  if (!data.subject) {
    errors.subject = 'Subject is required';
  } else if (!isValidSubject(data.subject)) {
    errors.subject = 'Invalid subject selected';
  }

  // Due date validation
  if (!data.dueDate) {
    errors.dueDate = 'Due date is required';
  } else {
    const date = parseDateString(data.dueDate);
    if (!date) {
      errors.dueDate = 'Invalid date format';
    }
  }

  // Recurrence validation
  if (data.recurrence && !isValidRecurrence(data.recurrence)) {
    errors.recurrence = 'Invalid recurrence type';
  }

  // Priority validation
  if (data.priority && !isValidPriority(data.priority)) {
    errors.priority = 'Invalid priority';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates study session form data
 * @param data - Partial session data to validate
 * @returns Validation result with errors
 */
export function validateSession(
  data: Partial<StudySession>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Session title is required';
  } else if (data.title.trim().length < 3) {
    errors.title = 'Session title must be at least 3 characters';
  } else if (data.title.trim().length > 100) {
    errors.title = 'Session title must be less than 100 characters';
  }

  // Subject validation
  if (!data.subject) {
    errors.subject = 'Subject is required';
  } else if (!isValidSubject(data.subject)) {
    errors.subject = 'Invalid subject selected';
  }

  // Start time validation
  if (!data.start) {
    errors.start = 'Start time is required';
  } else {
    const startDate = parseDateString(data.start);
    if (!startDate) {
      errors.start = 'Invalid start time format';
    }
  }

  // End time validation
  if (!data.end) {
    errors.end = 'End time is required';
  } else {
    const endDate = parseDateString(data.end);
    if (!endDate) {
      errors.end = 'Invalid end time format';
    }
  }

  // Time range validation
  if (data.start && data.end) {
    const startDate = parseDateString(data.start);
    const endDate = parseDateString(data.end);
    if (startDate && endDate) {
      if (!isDateBefore(data.start, data.end)) {
        errors.end = 'End time must be after start time';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates mark/score form data
 * @param data - Partial mark data to validate
 * @returns Validation result with errors
 */
export function validateMark(
  data: Partial<Mark>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Subject validation
  if (!data.subject) {
    errors.subject = 'Subject is required';
  } else if (!isValidSubject(data.subject)) {
    errors.subject = 'Invalid subject selected';
  }

  // Score validation
  if (data.score === undefined || data.score === null) {
    errors.score = 'Score is required';
  } else if (typeof data.score !== 'number' || isNaN(data.score)) {
    errors.score = 'Score must be a number';
  } else if (data.score < 0) {
    errors.score = 'Score cannot be negative';
  }

  // Max score validation
  if (data.maxScore === undefined || data.maxScore === null) {
    errors.maxScore = 'Maximum score is required';
  } else if (typeof data.maxScore !== 'number' || isNaN(data.maxScore)) {
    errors.maxScore = 'Maximum score must be a number';
  } else if (data.maxScore <= 0) {
    errors.maxScore = 'Maximum score must be greater than 0';
  }

  // Score vs max score validation
  if (
    typeof data.score === 'number' &&
    typeof data.maxScore === 'number' &&
    data.score > data.maxScore
  ) {
    errors.score = 'Score cannot exceed maximum score';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const date = parseDateString(data.date);
    if (!date) {
      errors.date = 'Invalid date format';
    } else if (isDateAfter(data.date, new Date().toISOString())) {
      errors.date = 'Date cannot be in the future';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitizes a string input by trimming whitespace
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input.trim();
}

/**
 * Validates an email address (for future use)
 * @param email - Email to validate
 * @returns True if valid email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if a date string is in the past
 * @param dateStr - ISO date string
 * @returns True if date is in the past
 */
export function isPastDate(dateStr: string): boolean {
  return isDateBefore(dateStr, new Date().toISOString());
}
