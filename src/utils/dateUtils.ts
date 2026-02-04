/**
 * @fileoverview Date utility functions using date-fns.
 * Provides consistent date formatting and manipulation throughout the app.
 */

import {
  format,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  isBefore,
  isAfter,
  isSameDay,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

/**
 * Formats a date to a readable string
 * @param date - Date object or ISO string
 * @param formatStr - Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  formatStr: string = 'MMM d, yyyy'
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid date';
  }
  return format(dateObj, formatStr);
}

/**
 * Formats a date with time
 * @param date - Date object or ISO string
 * @returns Formatted date-time string
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Formats time only
 * @param date - Date object or ISO string
 * @returns Formatted time string
 */
export function formatTime(date: Date | string): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Formats a date for input fields (yyyy-MM-dd)
 * @param date - Date object or ISO string
 * @returns ISO date string for inputs
 */
export function formatDateForInput(date: Date | string): string {
  return formatDate(date, 'yyyy-MM-dd');
}

/**
 * Formats a datetime for input fields (yyyy-MM-ddTHH:mm)
 * @param date - Date object or ISO string
 * @returns ISO datetime string for inputs
 */
export function formatDateTimeForInput(date: Date | string): string {
  return formatDate(date, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Parses an ISO date string to a Date object
 * @param dateStr - ISO date string
 * @returns Date object or null if invalid
 */
export function parseDateString(dateStr: string): Date | null {
  const date = parseISO(dateStr);
  return isValid(date) ? date : null;
}

/**
 * Gets the start of a day
 * @param date - Date object or ISO string
 * @returns Date at start of day
 */
export function getStartOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(dateObj);
}

/**
 * Gets the end of a day
 * @param date - Date object or ISO string
 * @returns Date at end of day
 */
export function getEndOfDay(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(dateObj);
}

/**
 * Adds days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addDays(dateObj, days);
}

/**
 * Adds weeks to a date
 * @param date - Base date
 * @param weeks - Number of weeks to add
 * @returns New date
 */
export function addWeeksToDate(date: Date | string, weeks: number): Date {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return addWeeks(dateObj, weeks);
}

/**
 * Checks if a date is before another
 * @param date - Date to check
 * @param compareDate - Date to compare against
 * @returns True if date is before compareDate
 */
export function isDateBefore(
  date: Date | string,
  compareDate: Date | string
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const compareDateObj =
    typeof compareDate === 'string' ? parseISO(compareDate) : compareDate;
  return isBefore(dateObj, compareDateObj);
}

/**
 * Checks if a date is after another
 * @param date - Date to check
 * @param compareDate - Date to compare against
 * @returns True if date is after compareDate
 */
export function isDateAfter(
  date: Date | string,
  compareDate: Date | string
): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const compareDateObj =
    typeof compareDate === 'string' ? parseISO(compareDate) : compareDate;
  return isAfter(dateObj, compareDateObj);
}

/**
 * Checks if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if same day
 */
export function isSameDayDate(
  date1: Date | string,
  date2: Date | string
): boolean {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(dateObj1, dateObj2);
}

/**
 * Gets the difference in days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export function getDaysDifference(
  date1: Date | string,
  date2: Date | string
): number {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(dateObj1, dateObj2);
}

/**
 * Gets the difference in hours between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of hours between dates
 */
export function getHoursDifference(
  date1: Date | string,
  date2: Date | string
): number {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(dateObj1, dateObj2);
}

/**
 * Gets the difference in minutes between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of minutes between dates
 */
export function getMinutesDifference(
  date1: Date | string,
  date2: Date | string
): number {
  const dateObj1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInMinutes(dateObj1, dateObj2);
}

/**
 * Gets week boundaries for a date
 * @param date - Date object or ISO string
 * @returns Object with start and end of week
 */
export function getWeekBounds(date: Date | string): { start: Date; end: Date } {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfWeek(dateObj, { weekStartsOn: 1 }), // Monday
    end: endOfWeek(dateObj, { weekStartsOn: 1 }),
  };
}

/**
 * Gets month boundaries for a date
 * @param date - Date object or ISO string
 * @returns Object with start and end of month
 */
export function getMonthBounds(date: Date | string): { start: Date; end: Date } {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfMonth(dateObj),
    end: endOfMonth(dateObj),
  };
}

/**
 * Gets today's date at midnight
 * @returns Today's date at 00:00:00
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Gets current date-time as ISO string
 * @returns Current date-time ISO string
 */
export function getCurrentISOString(): string {
  return new Date().toISOString();
}

/**
 * Formats duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Formats seconds to MM:SS format
 * @param seconds - Total seconds
 * @returns Formatted time string
 */
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Checks if a date is today
 * @param date - Date to check (string or Date)
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(dateObj, new Date());
}

/**
 * Checks if a date is tomorrow
 * @param date - Date to check (string or Date)
 * @returns True if the date is tomorrow
 */
export function isTomorrow(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(dateObj, tomorrow);
}

/**
 * Gets the number of days until exam date
 * @param examDate - Optional specific exam date (defaults to first exam Feb 17, 2026)
 * @returns Number of days until the exam
 */
export function getDaysUntilExam(examDate?: Date | string): number {
  const targetDate = examDate 
    ? (typeof examDate === 'string' ? parseISO(examDate) : examDate)
    : parseISO('2026-02-17'); // First O/L exam date
  const today = startOfDay(new Date());
  return differenceInDays(targetDate, today);
}
