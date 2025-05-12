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
  subjectId: string;
  taskId?: string; // Optional: if time was logged for a specific task
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  notes?: string;
  focusScore?: number; // AI-powered metric
  distractionsLogged?: number; // Number of distractions during session
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