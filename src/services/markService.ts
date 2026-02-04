/**
 * @fileoverview Mark service for managing score/marks persistence.
 * Handles CRUD operations for progress tracking.
 */

import type { Mark, Subject, SubjectStats } from '../types';
import { SUBJECTS } from '../types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from './storageService';
import {
  generateMarkId,
  getCurrentISOString,
} from '../utils';

/**
 * Gets all marks from storage
 * @returns Array of marks
 */
export function getAllMarks(): Mark[] {
  return getStorageItem<Mark[]>(STORAGE_KEYS.MARKS, []);
}

/**
 * Gets marks filtered by subject
 * @param subject - Subject to filter by
 * @returns Filtered marks
 */
export function getMarksBySubject(subject: Subject): Mark[] {
  const marks = getAllMarks();
  return marks
    .filter((mark) => mark.subject === subject)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * Gets recent marks
 * @param limit - Maximum number of marks to return
 * @returns Array of recent marks
 */
export function getRecentMarks(limit: number = 10): Mark[] {
  const marks = getAllMarks();
  return marks.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}

/**
 * Creates a new mark entry
 * @param markData - Mark data without id and timestamp
 * @returns Created mark
 */
export function createMark(
  markData: Omit<Mark, 'id' | 'createdAt'>
): Mark {
  const marks = getAllMarks();
  const newMark: Mark = {
    ...markData,
    id: generateMarkId(),
    createdAt: getCurrentISOString(),
  };
  marks.push(newMark);
  setStorageItem(STORAGE_KEYS.MARKS, marks);
  return newMark;
}

/**
 * Updates an existing mark
 * @param markId - ID of mark to update
 * @param updates - Partial mark updates
 * @returns Updated mark or null if not found
 */
export function updateMark(
  markId: string,
  updates: Partial<Omit<Mark, 'id' | 'createdAt'>>
): Mark | null {
  const marks = getAllMarks();
  const index = marks.findIndex((m) => m.id === markId);
  if (index === -1) {
    console.error(`Mark not found: ${markId}`);
    return null;
  }
  marks[index] = { ...marks[index], ...updates };
  setStorageItem(STORAGE_KEYS.MARKS, marks);
  return marks[index];
}

/**
 * Deletes a mark
 * @param markId - ID of mark to delete
 * @returns True if deleted, false if not found
 */
export function deleteMark(markId: string): boolean {
  const marks = getAllMarks();
  const index = marks.findIndex((m) => m.id === markId);
  if (index === -1) {
    console.error(`Mark not found: ${markId}`);
    return false;
  }
  marks.splice(index, 1);
  setStorageItem(STORAGE_KEYS.MARKS, marks);
  return true;
}

/**
 * Calculates average score for a subject
 * @param subject - Subject to calculate average for
 * @returns Average percentage or 0 if no marks
 */
export function getAverageScore(subject: Subject): number {
  const marks = getMarksBySubject(subject);
  if (marks.length === 0) return 0;

  const totalPercentage = marks.reduce(
    (sum, mark) => sum + (mark.score / mark.maxScore) * 100,
    0
  );
  return Math.round(totalPercentage / marks.length);
}

/**
 * Calculates overall average across all subjects
 * @returns Overall average percentage
 */
export function getOverallAverage(): number {
  const marks = getAllMarks();
  if (marks.length === 0) return 0;

  const totalPercentage = marks.reduce(
    (sum, mark) => sum + (mark.score / mark.maxScore) * 100,
    0
  );
  return Math.round(totalPercentage / marks.length);
}

/**
 * Gets the trend for a subject (improving, declining, stable)
 * @param subject - Subject to analyze
 * @returns Trend string
 */
export function getSubjectTrend(
  subject: Subject
): 'improving' | 'declining' | 'stable' {
  const marks = getMarksBySubject(subject);
  if (marks.length < 2) return 'stable';

  // Get last 5 marks sorted by date (newest first)
  const recentMarks = marks.slice(0, 5);
  if (recentMarks.length < 2) return 'stable';

  // Calculate percentages
  const percentages = recentMarks.map((m) => (m.score / m.maxScore) * 100);

  // Compare first (newest) with last (oldest) in recent marks
  const newestPercent = percentages[0];
  const oldestPercent = percentages[percentages.length - 1];
  const difference = newestPercent - oldestPercent;

  if (difference > 5) return 'improving';
  if (difference < -5) return 'declining';
  return 'stable';
}

/**
 * Gets statistics for all subjects
 * @param studyHoursBySubject - Study hours by subject (passed to avoid circular dep)
 * @returns Array of subject statistics
 */
export function getSubjectStats(studyHoursBySubject?: Record<Subject, number>): SubjectStats[] {
  const studyHours = studyHoursBySubject || {
    Mathematics: 0,
    Science: 0,
    Sinhala: 0,
    English: 0,
    History: 0,
    Buddhism: 0,
  };

  return SUBJECTS.map((subject) => {
    const marks = getMarksBySubject(subject);
    const averageScore = getAverageScore(subject);
    const latestMark = marks[0];

    return {
      subject,
      averageScore,
      totalTests: marks.length,
      totalStudyHours: studyHours[subject] || 0,
      latestScore: latestMark
        ? Math.round((latestMark.score / latestMark.maxScore) * 100)
        : undefined,
      trend: getSubjectTrend(subject),
    };
  });
}

/**
 * Gets weak subjects (average below 60%)
 * @returns Array of weak subject names
 */
export function getWeakSubjects(): Subject[] {
  const stats = getSubjectStats();
  return stats
    .filter((stat) => stat.totalTests > 0 && stat.averageScore < 60)
    .map((stat) => stat.subject);
}

/**
 * Gets strong subjects (average above 80%)
 * @returns Array of strong subject names
 */
export function getStrongSubjects(): Subject[] {
  const stats = getSubjectStats();
  return stats
    .filter((stat) => stat.totalTests > 0 && stat.averageScore >= 80)
    .map((stat) => stat.subject);
}

/**
 * Gets marks data formatted for charts
 * @param subject - Optional subject to filter
 * @returns Array of chart data points
 */
export function getMarksChartData(
  subject?: Subject
): Array<{ date: string; score: number; subject: Subject }> {
  const marks = subject ? getMarksBySubject(subject) : getAllMarks();
  return marks
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((mark) => ({
      date: mark.date.split('T')[0],
      score: Math.round((mark.score / mark.maxScore) * 100),
      subject: mark.subject,
    }));
}

/**
 * Mark service object with all operations
 */
export const markService = {
  getAll: getAllMarks,
  getBySubject: getMarksBySubject,
  getRecent: getRecentMarks,
  create: createMark,
  update: updateMark,
  delete: deleteMark,
  getAverage: getAverageScore,
  getOverallAverage,
  getTrend: getSubjectTrend,
  getStats: getSubjectStats,
  getWeak: getWeakSubjects,
  getStrong: getStrongSubjects,
  getChartData: getMarksChartData,
};
