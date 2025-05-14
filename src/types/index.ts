// src/types/index.ts
export interface Subject {
  id: string;
  name: string;
  color: string; // e.g., hex code for UI theming
  targetHours?: number;
}

export interface Task {
  id: string;
  subjectId: string; // Link to Subject
  description: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface LoggedSession {
  id: string;
  startTime: string | Date;
  endTime: string | Date;
  durationMinutes: number;
  subjectId: string;
  notes?: string;
  taskId?: string;
  userId?: string;
  focusScore?: number; // AI-powered metric
  distractionsLogged?: number; // Number of distractions during session
  tasksCompleted?: string[]; // List of completed tasks during the session
  materials?: string[]; // Study materials used
  tags?: string[]; // Tags associated with the session
}

// User authentication
export interface User {
  id: string;
  username: string;
  displayName: string;
  email?: string;
  points: number;
  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  error: string | null;
}

// User statistics
export interface UserStats {
  studyPoints: number;
  // Add other stat properties as needed
}

// Application state
export interface AppState {
  auth: AuthState;
  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
  points: number;
  streakData: StreakData;
  isOnline: boolean;
  isSyncing: boolean;
  userStats: UserStats;
  // Add other state properties
}

// Types for analytics and history
export interface SessionFilters {
  subjectId?: string;
  dateRange: 'all' | '7days' | '30days' | 'custom';
  startDate?: Date;
  endDate?: Date;
  taskStatus?: 'all' | 'completed' | 'incomplete';
}

export interface WeeklySummary {
  week: string;
  totalHours: number;
  targetHours: number;
  subjectBreakdown: {
    [subjectId: string]: number; // hours per subject
  };
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  color?: string; // Add color property
  description?: string;
  location?: string;
  subjectId?: string;
  taskId?: string;
  sessionId?: string;
  source: 'google' | 'local' | 'study-session' | 'class' | 'reminder';
  editable: boolean;
  isRecurring?: boolean;
  reminderId?: string;
  classId?: string;
  userId?: string;
  rrule?: string; // Add rrule property for recurring events
  lastSync?: Date;
}

export interface CalendarClass {
  id: string;
  title: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
  startRecur: string | Date; // Allow both string and Date
  endRecur?: string | Date; // Allow both string and Date
  color?: string;
  location?: string;
  notes?: string;
  subjectId?: string;
  userId?: string;
}

export interface CalendarReminder {
  id: string;
  title: string;
  date: Date;
  time?: string; // HH:MM format
  description?: string;
  subjectId?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  userId?: string;
}

// FullCalendar compatible types for DateSelectArg and EventClickArg
export interface DateSelectArg {
  start: Date;
  end: Date;
  allDay: boolean;
  view: any;
  jsEvent: MouseEvent | null;
  resource?: any;
}

export interface EventClickArg {
  el: HTMLElement;
  event: {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    extendedProps: any;
    [key: string]: any;
  };
  jsEvent: MouseEvent;
  view: any;
}

// Navigation types
export type NavRoute = 'timer' | 'dashboard' | 'history' | 'profile' | 'settings' | 'calendar';

export interface GoogleCalendarAuth {
  isAuthenticated: boolean;
  accessToken?: string;
  tokenExpiresAt?: Date;
  refreshToken?: string;
  calendarId?: string;
  error?: string;
}

export interface SyncState {
  lastSyncTime?: Date;
  pendingSyncs: CalendarEvent[];
  syncErrors?: Record<string, string>;
  isSyncing: boolean;
}