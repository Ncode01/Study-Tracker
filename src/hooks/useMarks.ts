/**
 * @fileoverview Marks/progress tracking hook.
 * Provides reactive marks state and statistics.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Mark, Subject, SubjectStats } from '../types';
import { markService } from '../services/markService';
import { sessionService } from '../services/sessionService';

/**
 * Mark creation data
 */
export interface CreateMarkData {
  subject: Subject;
  score: number;
  maxScore: number;
  date: string;
  testName?: string;
}

/**
 * Mark update data
 */
export interface UpdateMarkData {
  subject?: Subject;
  score?: number;
  maxScore?: number;
  date?: string;
  testName?: string;
}

/**
 * Custom hook for marks management
 * @returns Marks state and operations
 */
export function useMarks() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads marks from storage
   */
  const loadMarks = useCallback(() => {
    try {
      setLoading(true);
      const loadedMarks = markService.getAll();
      setMarks(loadedMarks);
      setError(null);
    } catch (err) {
      console.error('Error loading marks:', err);
      setError('Failed to load marks');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load marks on mount
  useEffect(() => {
    loadMarks();
  }, [loadMarks]);

  /**
   * Creates a new mark
   * @param data - Mark creation data
   * @returns Created mark
   */
  const addMark = useCallback((data: CreateMarkData): Mark => {
    const newMark = markService.create({
      subject: data.subject,
      score: data.score,
      maxScore: data.maxScore,
      date: data.date,
      testName: data.testName,
    });
    setMarks((prev) => [...prev, newMark]);
    return newMark;
  }, []);

  /**
   * Updates an existing mark
   * @param markId - ID of mark to update
   * @param updates - Partial updates
   * @returns Updated mark or null
   */
  const updateMark = useCallback(
    (markId: string, updates: UpdateMarkData): Mark | null => {
      const updatedMark = markService.update(markId, updates);
      if (updatedMark) {
        setMarks((prev) =>
          prev.map((m) => (m.id === markId ? updatedMark : m))
        );
      }
      return updatedMark;
    },
    []
  );

  /**
   * Deletes a mark
   * @param markId - ID of mark to delete
   * @returns True if deleted
   */
  const deleteMark = useCallback((markId: string): boolean => {
    const success = markService.delete(markId);
    if (success) {
      setMarks((prev) => prev.filter((m) => m.id !== markId));
    }
    return success;
  }, []);

  /**
   * Gets marks by subject
   * @param subject - Subject to filter by
   * @returns Filtered marks
   */
  const getMarksBySubject = useCallback(
    (subject: Subject): Mark[] => {
      return marks
        .filter((m) => m.subject === subject)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    [marks]
  );

  /**
   * Gets recent marks
   * @param limit - Maximum number to return
   * @returns Recent marks
   */
  const getRecentMarks = useCallback(
    (limit: number = 10): Mark[] => {
      return marks
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
    },
    [marks]
  );

  /**
   * Gets overall average
   */
  const overallAverage = useMemo((): number => {
    if (marks.length === 0) return 0;
    const total = marks.reduce(
      (sum, m) => sum + (m.score / m.maxScore) * 100,
      0
    );
    return Math.round(total / marks.length);
  }, [marks]);

  /**
   * Gets subject statistics
   * @returns Array of subject stats
   */
  const getSubjectStats = useCallback((): SubjectStats[] => {
    const studyHours = sessionService.getHoursBySubject();
    return markService.getStats(studyHours);
  }, []);

  /**
   * Gets weak subjects
   * @returns Array of weak subject names
   */
  const getWeakSubjects = useCallback((): Subject[] => {
    const stats = getSubjectStats();
    return stats
      .filter((s) => s.totalTests > 0 && s.averageScore < 60)
      .map((s) => s.subject);
  }, [getSubjectStats]);

  /**
   * Gets strong subjects
   * @returns Array of strong subject names
   */
  const getStrongSubjects = useCallback((): Subject[] => {
    const stats = getSubjectStats();
    return stats
      .filter((s) => s.totalTests > 0 && s.averageScore >= 80)
      .map((s) => s.subject);
  }, [getSubjectStats]);

  /**
   * Gets chart data for visualizations
   * @param subject - Optional subject filter
   * @returns Chart data array
   */
  const getChartData = useCallback(
    (
      subject?: Subject
    ): Array<{ date: string; score: number; subject: Subject }> => {
      const filteredMarks = subject
        ? marks.filter((m) => m.subject === subject)
        : marks;

      return filteredMarks
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((m) => ({
          date: m.date.split('T')[0],
          score: Math.round((m.score / m.maxScore) * 100),
          subject: m.subject,
        }));
    },
    [marks]
  );

  return {
    marks,
    loading,
    error,
    overallAverage,
    addMark,
    updateMark,
    deleteMark,
    getMarksBySubject,
    getRecentMarks,
    getSubjectStats,
    getWeakSubjects,
    getStrongSubjects,
    getChartData,
    refresh: loadMarks,
  };
}

export default useMarks;
