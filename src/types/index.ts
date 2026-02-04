/**
 * @fileoverview Core type definitions for the Study Planner application.
 * Contains all TypeScript interfaces and types used throughout the app.
 */

/**
 * Available subjects for G.C.E. O/L examination
 */
export type Subject =
  | 'Mathematics'
  | 'Science'
  | 'Sinhala'
  | 'English'
  | 'History'
  | 'Buddhism';

/**
 * All available subjects as a constant array
 */
export const SUBJECTS: Subject[] = [
  'Mathematics',
  'Science',
  'Sinhala',
  'English',
  'History',
  'Buddhism',
];

/**
 * Subject color mapping for visual distinction
 */
export const SUBJECT_COLORS: Record<Subject, string> = {
  Mathematics: '#4F46E5', // Indigo
  Science: '#10B981', // Emerald
  Sinhala: '#F59E0B', // Amber
  English: '#EC4899', // Pink
  History: '#8B5CF6', // Purple
  Buddhism: '#F97316', // Orange
};

/**
 * Recurrence pattern for tasks
 */
export type RecurrenceType = 'none' | 'daily' | 'weekly';

/**
 * Task priority levels
 */
export type Priority = 'low' | 'medium' | 'high';

/**
 * Task interface for study tasks
 */
export interface Task {
  /** Unique identifier */
  id: string;
  /** Task title/description */
  title: string;
  /** Associated subject */
  subject: Subject;
  /** Whether task is completed */
  completed: boolean;
  /** Task due date (ISO string) */
  dueDate: string;
  /** Recurrence pattern */
  recurrence: RecurrenceType;
  /** Task priority */
  priority: Priority;
  /** Creation timestamp (ISO string) */
  createdAt: string;
  /** Last completion date for recurring tasks (ISO string) */
  lastCompletedAt?: string;
  /** Original task ID for recurring task instances */
  originalTaskId?: string;
}

/**
 * Study session for calendar scheduling
 */
export interface StudySession {
  /** Unique identifier */
  id: string;
  /** Session title */
  title: string;
  /** Associated subject */
  subject: Subject;
  /** Start time (ISO string) */
  start: string;
  /** End time (ISO string) */
  end: string;
  /** Optional notes */
  notes?: string;
  /** Whether session is completed */
  completed: boolean;
  /** Creation timestamp (ISO string) */
  createdAt: string;
}

/**
 * Exam event for the calendar
 */
export interface ExamEvent {
  /** Unique identifier */
  id: string;
  /** Exam subject */
  subject: Subject;
  /** Exam title */
  title: string;
  /** Exam date (ISO string) */
  date: string;
  /** Whether this is an exam (always true) */
  isExam: true;
}

/**
 * Pre-defined exam schedule for Feb 2026
 */
export const EXAM_SCHEDULE: ExamEvent[] = [
  {
    id: 'exam-buddhism',
    subject: 'Buddhism',
    title: 'G.C.E. O/L - Buddhism',
    date: '2026-02-17',
    isExam: true,
  },
  {
    id: 'exam-sinhala',
    subject: 'Sinhala',
    title: 'G.C.E. O/L - Sinhala',
    date: '2026-02-18',
    isExam: true,
  },
  {
    id: 'exam-history',
    subject: 'History',
    title: 'G.C.E. O/L - History',
    date: '2026-02-19',
    isExam: true,
  },
  {
    id: 'exam-english',
    subject: 'English',
    title: 'G.C.E. O/L - English',
    date: '2026-02-20',
    isExam: true,
  },
  {
    id: 'exam-mathematics',
    subject: 'Mathematics',
    title: 'G.C.E. O/L - Mathematics',
    date: '2026-02-23',
    isExam: true,
  },
  {
    id: 'exam-science',
    subject: 'Science',
    title: 'G.C.E. O/L - Science',
    date: '2026-02-25',
    isExam: true,
  },
];

/**
 * Mark entry for progress tracking
 */
export interface Mark {
  /** Unique identifier */
  id: string;
  /** Associated subject */
  subject: Subject;
  /** Score achieved */
  score: number;
  /** Maximum possible score */
  maxScore: number;
  /** Date of the test/practice (ISO string) */
  date: string;
  /** Optional test name/description */
  testName?: string;
  /** Creation timestamp (ISO string) */
  createdAt: string;
}

/**
 * Pomodoro timer modes
 */
export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

/**
 * Pomodoro timer configuration
 */
export interface PomodoroConfig {
  /** Focus duration in minutes */
  focusDuration: number;
  /** Short break duration in minutes */
  shortBreakDuration: number;
  /** Long break duration in minutes */
  longBreakDuration: number;
  /** Sessions before long break */
  sessionsBeforeLongBreak: number;
}

/**
 * Pomodoro timer state
 */
export interface PomodoroState {
  /** Current mode */
  mode: PomodoroMode;
  /** Time remaining in seconds */
  timeRemaining: number;
  /** Whether timer is running */
  isRunning: boolean;
  /** Current session count */
  sessionCount: number;
  /** Timer configuration */
  config: PomodoroConfig;
  /** Associated subject (optional) */
  subject?: Subject;
}

/**
 * Default Pomodoro configurations
 */
export const POMODORO_PRESETS: Record<string, PomodoroConfig> = {
  '25/5': {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
  '50/10': {
    focusDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    sessionsBeforeLongBreak: 4,
  },
};

/**
 * Notification types
 */
export type NotificationType = 'session' | 'task' | 'pomodoro';

/**
 * Notification permission status
 */
export type NotificationPermission = 'granted' | 'denied' | 'default';

/**
 * Scheduled notification
 */
export interface ScheduledNotification {
  /** Unique identifier */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Scheduled time (ISO string) */
  scheduledFor: string;
  /** Related entity ID (task, session, etc.) */
  relatedId?: string;
}

/**
 * Calendar event type (union of sessions and exams)
 */
export interface CalendarEvent {
  /** Unique identifier */
  id: string;
  /** Event title */
  title: string;
  /** Start time */
  start: Date;
  /** End time */
  end: Date;
  /** Associated subject */
  subject: Subject;
  /** Whether this is an exam */
  isExam?: boolean;
  /** Resource for calendar */
  resource?: StudySession | ExamEvent;
}

/**
 * Subject statistics for progress tracking
 */
export interface SubjectStats {
  /** Subject name */
  subject: Subject;
  /** Average score percentage */
  averageScore: number;
  /** Total tests taken */
  totalTests: number;
  /** Total study hours */
  totalStudyHours: number;
  /** Latest score */
  latestScore?: number;
  /** Trend (improving, declining, stable) */
  trend: 'improving' | 'declining' | 'stable';
}

/**
 * Application view/page names
 */
export type ViewName = 'dashboard' | 'calendar' | 'tasks' | 'progress' | 'timer';

/**
 * Form validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error messages by field */
  errors: Record<string, string>;
}
