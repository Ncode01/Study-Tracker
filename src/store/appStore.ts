// src/store/appStore.ts
import { create } from 'zustand';
import type { Subject, Task, LoggedSession, User, AuthState, StreakData } from '../types';
import { format, isYesterday, isToday, subDays } from 'date-fns';

interface AppState {
  // Auth state
  auth: AuthState;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // App data
  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
  points: number;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (taskId: string) => void;
  logSession: (session: Omit<LoggedSession, 'id'>) => void;
  updateSession: (updatedSession: LoggedSession) => void;
  deleteSession: (sessionId: string) => void;
  
  // Streak data
  streakData: StreakData;
  updateStreak: () => void;
}

let subjectIdCounter = 2; // Start from 2 because we have initial data
let taskIdCounter = 3; // Start from 3 because we have initial data
let sessionIdCounter = 1;

// Hardcoded user accounts
const users: User[] = [
  {
    id: 'user-1',
    username: 'student',
    displayName: 'Student User',
    email: 'student@example.com',
    points: 0,
    subjects: [],
    tasks: [],
    loggedSessions: []
  },
  {
    id: 'user-2',
    username: 'admin',
    displayName: 'Admin User',
    email: 'admin@example.com',
    points: 100,
    subjects: [],
    tasks: [],
    loggedSessions: []
  }
];

// In a real app, passwords would be hashed and not stored directly
const userPasswords: Record<string, string> = {
  'student': 'password123',
  'admin': 'admin123'
};

// Initial demo data
const initialSubjects: Subject[] = [
  { id: 'subj-0', name: 'Mathematics', color: '#FF5252', targetHours: 10 },
  { id: 'subj-1', name: 'Programming', color: '#42A5F5', targetHours: 15 },
];

const initialTasks: Task[] = [
  { 
    id: 'task-0', 
    subjectId: 'subj-0', 
    description: 'Practice calculus problems', 
    completed: false, 
    createdAt: new Date(),
    priority: 'high' 
  },
  { 
    id: 'task-1', 
    subjectId: 'subj-1', 
    description: 'Learn React hooks', 
    completed: false, 
    createdAt: new Date(),
    priority: 'medium' 
  },
  { 
    id: 'task-2', 
    subjectId: 'subj-1', 
    description: 'Build a small project', 
    completed: false, 
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3) // 3 days from now
  },
];

// Initial streak data
const initialStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null
};

// Helper function to calculate streak
const calculateStreak = (sessions: LoggedSession[]): StreakData => {
  if (sessions.length === 0) {
    return initialStreakData;
  }
  
  // Group sessions by date (to avoid counting multiple sessions on the same day)
  const sessionsByDate: Record<string, Date> = {};
  sessions.forEach(session => {
    const date = new Date(session.startTime);
    const dateKey = format(date, 'yyyy-MM-dd');
    sessionsByDate[dateKey] = date;
  });
  
  // Convert to array of dates, most recent first
  const dates = Object.values(sessionsByDate).sort((a, b) => b.getTime() - a.getTime());
  
  if (dates.length === 0) {
    return initialStreakData;
  }
  
  const mostRecentDate = dates[0];
  // Check if streak is active (most recent session is today or yesterday)
  const isStreakActive = isToday(mostRecentDate) || isYesterday(mostRecentDate);
  
  if (!isStreakActive) {
    return {
      currentStreak: 0,
      longestStreak: 0, // This would need persistent storage to maintain
      lastActiveDate: mostRecentDate
    };
  }
  
  // Calculate current streak
  let currentStreak = 1;
  let previousDate = mostRecentDate;
  
  for (let i = 1; i < dates.length; i++) {
    const expectedPreviousDay = subDays(previousDate, 1);
    const previousDayFormatted = format(expectedPreviousDay, 'yyyy-MM-dd');
    const currentDateFormatted = format(dates[i], 'yyyy-MM-dd');
    
    if (previousDayFormatted === currentDateFormatted) {
      currentStreak++;
      previousDate = dates[i];
    } else {
      break; // Streak broken
    }
  }
  
  return {
    currentStreak,
    longestStreak: currentStreak, // In a real app, we would persist and update this
    lastActiveDate: mostRecentDate
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initialize auth state
  auth: {
    isAuthenticated: false,
    currentUser: null,
    error: null
  },

  // Authentication methods
  login: (username, password) => {
    // Check if username exists and password matches
    if (userPasswords[username] === password) {
      const user = users.find(u => u.username === username);
      if (user) {
        set({ 
          auth: { 
            isAuthenticated: true, 
            currentUser: user, 
            error: null 
          }
        });
        return true;
      }
    }
    
    // Authentication failed
    set(state => ({
      auth: {
        ...state.auth,
        error: 'Invalid username or password'
      }
    }));
    return false;
  },

  logout: () => {
    set({
      auth: {
        isAuthenticated: false,
        currentUser: null,
        error: null
      }
    });
  },

  subjects: initialSubjects,
  tasks: initialTasks,
  loggedSessions: [],
  points: 0,
  streakData: initialStreakData,

  addSubject: (subjectData) =>
    set((state) => ({
      subjects: [...state.subjects, { ...subjectData, id: `subj-${subjectIdCounter++}` }],
    })),

  addTask: (taskData) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        { ...taskData, id: `task-${taskIdCounter++}`, completed: false, createdAt: new Date() },
      ],
    })),

  toggleTask: (taskId) =>
    set((state) => {
      let pointsEarned = 0;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id === taskId) {
          if (!task.completed) pointsEarned = 10; // Award 10 points for completion
          return { ...task, completed: !task.completed };
        }
        return task;
      });
      return { tasks: updatedTasks, points: state.points + pointsEarned };
    }),

  logSession: (sessionData) =>
    set((state) => {
      const newSession = { 
        ...sessionData, 
        id: `sess-${sessionIdCounter++}` 
      };
      const newSessions = [...state.loggedSessions, newSession];
      const earnedPoints = Math.floor(sessionData.durationMinutes / 10); // 1 point per 10 mins
      
      // Update streak data
      const newStreakData = calculateStreak(newSessions);
      
      return {
        loggedSessions: newSessions,
        points: state.points + earnedPoints,
        streakData: newStreakData
      };
    }),
    
  updateSession: (updatedSession) =>
    set((state) => {
      const updatedSessions = state.loggedSessions.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      );
      
      return { loggedSessions: updatedSessions };
    }),
    
  deleteSession: (sessionId) =>
    set((state) => {
      const deletedSession = state.loggedSessions.find(session => session.id === sessionId);
      const updatedSessions = state.loggedSessions.filter(session => session.id !== sessionId);
      
      // Recalculate points
      let pointsToDeduct = 0;
      if (deletedSession) {
        pointsToDeduct = Math.floor(deletedSession.durationMinutes / 10);
      }
      
      // Recalculate streak after deletion
      const newStreakData = calculateStreak(updatedSessions);
      
      return { 
        loggedSessions: updatedSessions,
        points: Math.max(0, state.points - pointsToDeduct),
        streakData: newStreakData
      };
    }),
    
  updateStreak: () =>
    set((state) => {
      const newStreakData = calculateStreak(state.loggedSessions);
      return { streakData: newStreakData };
    })
}));