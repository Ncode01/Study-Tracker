/**
 * @fileoverview Session service for managing study session persistence.
 * Handles CRUD operations for calendar events.
 */

import type { StudySession, Subject, CalendarEvent } from '../types';
import { EXAM_SCHEDULE } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';
import {
  generateSessionId,
  getCurrentISOString,
  parseDateString,
  isDateBefore,
  isDateAfter,
  getHoursDifference,
} from '../utils';

/**
 * Gets all study sessions from storage
 * @returns Array of study sessions
 */
export function getAllSessions(): StudySession[] {
  return getStorageItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
}

/**
 * Gets sessions filtered by subject
 * @param subject - Subject to filter by
 * @returns Filtered sessions
 */
export function getSessionsBySubject(subject: Subject): StudySession[] {
  const sessions = getAllSessions();
  return sessions.filter((session) => session.subject === subject);
}

/**
 * Gets sessions for a specific date
 * @param date - Date to filter by (ISO string)
 * @returns Sessions on that date
 */
export function getSessionsByDate(date: string): StudySession[] {
  const sessions = getAllSessions();
  const dateStr = date.split('T')[0];
  return sessions.filter((session) => session.start.startsWith(dateStr));
}

/**
 * Gets upcoming sessions
 * @param limit - Maximum number of sessions to return
 * @returns Array of upcoming sessions
 */
export function getUpcomingSessions(limit?: number): StudySession[] {
  const sessions = getAllSessions();
  const now = new Date().toISOString();
  const upcoming = sessions
    .filter((session) => isDateAfter(session.start, now))
    .sort((a, b) => a.start.localeCompare(b.start));
  return limit ? upcoming.slice(0, limit) : upcoming;
}

/**
 * Creates a new study session
 * @param sessionData - Session data without id and timestamps
 * @returns Created session
 */
export function createSession(
  sessionData: Omit<StudySession, 'id' | 'createdAt' | 'completed'>
): StudySession {
  const sessions = getAllSessions();
  const newSession: StudySession = {
    ...sessionData,
    id: generateSessionId(),
    completed: false,
    createdAt: getCurrentISOString(),
  };
  sessions.push(newSession);
  setStorageItem(STORAGE_KEYS.SESSIONS, sessions);
  return newSession;
}

/**
 * Updates an existing session
 * @param sessionId - ID of session to update
 * @param updates - Partial session updates
 * @returns Updated session or null if not found
 */
export function updateSession(
  sessionId: string,
  updates: Partial<Omit<StudySession, 'id' | 'createdAt'>>
): StudySession | null {
  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    console.error(`Session not found: ${sessionId}`);
    return null;
  }
  sessions[index] = { ...sessions[index], ...updates };
  setStorageItem(STORAGE_KEYS.SESSIONS, sessions);
  return sessions[index];
}

/**
 * Deletes a session
 * @param sessionId - ID of session to delete
 * @returns True if deleted, false if not found
 */
export function deleteSession(sessionId: string): boolean {
  const sessions = getAllSessions();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    console.error(`Session not found: ${sessionId}`);
    return false;
  }
  sessions.splice(index, 1);
  setStorageItem(STORAGE_KEYS.SESSIONS, sessions);
  return true;
}

/**
 * Converts study sessions to calendar events
 * @param sessions - Array of study sessions
 * @returns Array of calendar events
 */
export function sessionsToCalendarEvents(
  sessions: StudySession[]
): CalendarEvent[] {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
    start: parseDateString(session.start) || new Date(),
    end: parseDateString(session.end) || new Date(),
    subject: session.subject,
    isExam: false,
    resource: session,
  }));
}

/**
 * Converts exam schedule to calendar events
 * @returns Array of calendar events for exams
 */
export function examsToCalendarEvents(): CalendarEvent[] {
  return EXAM_SCHEDULE.map((exam) => {
    const examDate = parseDateString(exam.date) || new Date();
    // Set exam time to 9 AM - 12 PM
    const start = new Date(examDate);
    start.setHours(9, 0, 0, 0);
    const end = new Date(examDate);
    end.setHours(12, 0, 0, 0);

    return {
      id: exam.id,
      title: exam.title,
      start,
      end,
      subject: exam.subject,
      isExam: true,
      resource: exam,
    };
  });
}

/**
 * Gets all calendar events (sessions + exams)
 * @returns Array of all calendar events
 */
export function getAllCalendarEvents(): CalendarEvent[] {
  const sessions = getAllSessions();
  const sessionEvents = sessionsToCalendarEvents(sessions);
  const examEvents = examsToCalendarEvents();
  return [...sessionEvents, ...examEvents];
}

/**
 * Checks for overlapping sessions
 * @param start - Start time
 * @param end - End time
 * @param excludeId - Session ID to exclude from check
 * @returns Array of overlapping sessions
 */
export function getOverlappingSessions(
  start: string,
  end: string,
  excludeId?: string
): StudySession[] {
  const sessions = getAllSessions();
  return sessions.filter((session) => {
    if (excludeId && session.id === excludeId) return false;
    const sessionStart = session.start;
    const sessionEnd = session.end;
    // Check for overlap
    return (
      (isDateAfter(start, sessionStart) && isDateBefore(start, sessionEnd)) ||
      (isDateAfter(end, sessionStart) && isDateBefore(end, sessionEnd)) ||
      (isDateBefore(start, sessionStart) && isDateAfter(end, sessionEnd)) ||
      start === sessionStart ||
      end === sessionEnd
    );
  });
}

/**
 * Calculates total study hours
 * @param sessions - Sessions to calculate
 * @returns Total hours
 */
export function calculateTotalStudyHours(sessions: StudySession[]): number {
  return sessions.reduce((total, session) => {
    const hours = Math.abs(getHoursDifference(session.end, session.start));
    return total + hours;
  }, 0);
}

/**
 * Gets study hours by subject
 * @returns Object with study hours per subject
 */
export function getStudyHoursBySubject(): Record<Subject, number> {
  const sessions = getAllSessions();
  const hours: Record<Subject, number> = {
    Mathematics: 0,
    Science: 0,
    Sinhala: 0,
    English: 0,
    History: 0,
    Buddhism: 0,
  };

  sessions.forEach((session) => {
    const sessionHours = Math.abs(
      getHoursDifference(session.end, session.start)
    );
    hours[session.subject] += sessionHours;
  });

  return hours;
}

/**
 * Session service object with all operations
 */
export const sessionService = {
  getAll: getAllSessions,
  getBySubject: getSessionsBySubject,
  getByDate: getSessionsByDate,
  getUpcoming: getUpcomingSessions,
  create: createSession,
  update: updateSession,
  delete: deleteSession,
  toCalendarEvents: sessionsToCalendarEvents,
  getExamEvents: examsToCalendarEvents,
  getAllCalendarEvents,
  getOverlapping: getOverlappingSessions,
  getTotalHours: calculateTotalStudyHours,
  getHoursBySubject: getStudyHoursBySubject,
};
