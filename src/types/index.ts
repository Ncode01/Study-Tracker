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
}

// New types for user authentication
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