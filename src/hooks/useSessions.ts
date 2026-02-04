/**
 * @fileoverview Study session management hook.
 * Provides reactive session state and calendar operations.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { StudySession, Subject, CalendarEvent } from '../types';
import { sessionService } from '../services/sessionService';

/**
 * Session creation data
 */
export interface CreateSessionData {
  title: string;
  subject: Subject;
  start: string;
  end: string;
  notes?: string;
}

/**
 * Session update data
 */
export interface UpdateSessionData {
  title?: string;
  subject?: Subject;
  start?: string;
  end?: string;
  notes?: string;
  completed?: boolean;
}

/**
 * Custom hook for study session management
 * @returns Session state and operations
 */
export function useSessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads sessions from storage
   */
  const loadSessions = useCallback(() => {
    try {
      setLoading(true);
      const loadedSessions = sessionService.getAll();
      setSessions(loadedSessions);
      setError(null);
    } catch (err) {
      console.error('Error loading sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * Calendar events (sessions + exams)
   */
  const calendarEvents = useMemo((): CalendarEvent[] => {
    const sessionEvents = sessionService.toCalendarEvents(sessions);
    const examEvents = sessionService.getExamEvents();
    return [...sessionEvents, ...examEvents];
  }, [sessions]);

  /**
   * Creates a new session
   * @param data - Session creation data
   * @returns Created session
   */
  const addSession = useCallback((data: CreateSessionData): StudySession => {
    const newSession = sessionService.create({
      title: data.title,
      subject: data.subject,
      start: data.start,
      end: data.end,
      notes: data.notes,
    });
    setSessions((prev) => [...prev, newSession]);
    return newSession;
  }, []);

  /**
   * Updates an existing session
   * @param sessionId - ID of session to update
   * @param updates - Partial updates
   * @returns Updated session or null
   */
  const updateSession = useCallback(
    (sessionId: string, updates: UpdateSessionData): StudySession | null => {
      const updatedSession = sessionService.update(sessionId, updates);
      if (updatedSession) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? updatedSession : s))
        );
      }
      return updatedSession;
    },
    []
  );

  /**
   * Updates session from calendar drag/resize
   * @param event - Calendar event
   * @param start - New start time
   * @param end - New end time
   * @returns Updated session or null
   */
  const moveSession = useCallback(
    (
      eventId: string,
      start: Date,
      end: Date
    ): StudySession | null => {
      return updateSession(eventId, {
        start: start.toISOString(),
        end: end.toISOString(),
      });
    },
    [updateSession]
  );

  /**
   * Deletes a session
   * @param sessionId - ID of session to delete
   * @returns True if deleted
   */
  const deleteSession = useCallback((sessionId: string): boolean => {
    const success = sessionService.delete(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
    return success;
  }, []);

  /**
   * Gets sessions by subject
   * @param subject - Subject to filter by
   * @returns Filtered sessions
   */
  const getSessionsBySubject = useCallback(
    (subject: Subject): StudySession[] => {
      return sessions.filter((s) => s.subject === subject);
    },
    [sessions]
  );

  /**
   * Gets upcoming sessions
   * @param limit - Maximum number to return
   * @returns Upcoming sessions
   */
  const getUpcomingSessions = useCallback(
    (limit?: number): StudySession[] => {
      const now = new Date().toISOString();
      const upcoming = sessions
        .filter((s) => s.start > now)
        .sort((a, b) => a.start.localeCompare(b.start));
      return limit ? upcoming.slice(0, limit) : upcoming;
    },
    [sessions]
  );

  /**
   * Gets today's sessions
   * @returns Today's sessions
   */
  const getTodaysSessions = useCallback((): StudySession[] => {
    const today = new Date().toISOString().split('T')[0];
    return sessions.filter((s) => s.start.startsWith(today));
  }, [sessions]);

  /**
   * Gets study hours by subject
   * @returns Hours per subject
   */
  const getStudyHoursBySubject = useCallback((): Record<Subject, number> => {
    return sessionService.getHoursBySubject();
  }, []);

  /**
   * Checks for overlapping sessions
   * @param start - Start time
   * @param end - End time
   * @param excludeId - Session to exclude
   * @returns Overlapping sessions
   */
  const checkOverlap = useCallback(
    (start: string, end: string, excludeId?: string): StudySession[] => {
      return sessionService.getOverlapping(start, end, excludeId);
    },
    []
  );

  return {
    sessions,
    calendarEvents,
    loading,
    error,
    addSession,
    updateSession,
    moveSession,
    deleteSession,
    getSessionsBySubject,
    getUpcomingSessions,
    getTodaysSessions,
    getStudyHoursBySubject,
    checkOverlap,
    refresh: loadSessions,
  };
}

export default useSessions;
