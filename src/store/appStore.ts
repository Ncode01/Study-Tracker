// src/store/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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

// Helper functions to handle user data persistence
const getUserData = (userId: string) => {
  const userDataKey = `study-tracker-user-${userId}`;
  const savedData = localStorage.getItem(userDataKey);
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      
      // Convert date strings back to Date objects
      if (parsedData.tasks) {
        parsedData.tasks.forEach((task: any) => {
          task.createdAt = new Date(task.createdAt);
          if (task.dueDate) task.dueDate = new Date(task.dueDate);
        });
      }
      
      if (parsedData.loggedSessions) {
        parsedData.loggedSessions.forEach((session: any) => {
          session.startTime = new Date(session.startTime);
          session.endTime = new Date(session.endTime);
        });
      }
      
      if (parsedData.streakData && parsedData.streakData.lastActiveDate) {
        parsedData.streakData.lastActiveDate = new Date(parsedData.streakData.lastActiveDate);
      }
      
      return parsedData;
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      return null;
    }
  }
  
  return null;
};

const saveUserData = (userId: string, data: any) => {
  const userDataKey = `study-tracker-user-${userId}`;
  try {
    localStorage.setItem(userDataKey, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Error saving user data to localStorage:", e);
    return false;
  }
};

// Initialize counters from saved data if available
const initializeCounters = (data: any) => {
  if (data) {
    if (data.subjects && data.subjects.length > 0) {
      const maxSubjectId = Math.max(...data.subjects.map((s: Subject) => 
        parseInt(s.id.split('-')[1]) || 0
      ));
      subjectIdCounter = maxSubjectId + 1;
    }
    
    if (data.tasks && data.tasks.length > 0) {
      const maxTaskId = Math.max(...data.tasks.map((t: Task) => 
        parseInt(t.id.split('-')[1]) || 0
      ));
      taskIdCounter = maxTaskId + 1;
    }
    
    if (data.loggedSessions && data.loggedSessions.length > 0) {
      const maxSessionId = Math.max(...data.loggedSessions.map((s: LoggedSession) => 
        parseInt(s.id.split('-')[1]) || 0
      ));
      sessionIdCounter = maxSessionId + 1;
    }
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
            // Get saved user data from localStorage
            const savedData = getUserData(user.id);
            
            // Initialize ID counters from saved data
            if (savedData) {
              initializeCounters(savedData);
            }
            
            const userData = {
              subjects: savedData?.subjects || initialSubjects,
              tasks: savedData?.tasks || initialTasks,
              loggedSessions: savedData?.loggedSessions || [],
              points: savedData?.points !== undefined ? savedData.points : (user.username === 'admin' ? 100 : 0),
              streakData: savedData?.streakData || initialStreakData
            };
            
            set({ 
              auth: { 
                isAuthenticated: true, 
                currentUser: user, 
                error: null 
              },
              ...userData
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
        // Save current state to localStorage before logging out
        const { auth, subjects, tasks, loggedSessions, points, streakData } = get();
        
        if (auth.currentUser) {
          const userData = {
            subjects,
            tasks,
            loggedSessions,
            points,
            streakData
          };
          
          saveUserData(auth.currentUser.id, userData);
        }
        
        // Reset app state
        set({
          auth: {
            isAuthenticated: false,
            currentUser: null,
            error: null
          },
          subjects: [],
          tasks: [],
          loggedSessions: [],
          points: 0,
          streakData: initialStreakData
        });
      },

      subjects: initialSubjects,
      tasks: initialTasks,
      loggedSessions: [],
      points: 0,
      streakData: initialStreakData,

      addSubject: (subjectData) => {
        set((state) => {
          const newState = {
            subjects: [...state.subjects, { ...subjectData, id: `subj-${subjectIdCounter++}` }],
          };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: newState.subjects,
              tasks: state.tasks,
              loggedSessions: state.loggedSessions,
              points: state.points,
              streakData: state.streakData
            });
          }
          
          return newState;
        });
      },

      addTask: (taskData) => {
        set((state) => {
          const newState = {
            tasks: [
              ...state.tasks,
              { ...taskData, id: `task-${taskIdCounter++}`, completed: false, createdAt: new Date() },
            ],
          };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: newState.tasks,
              loggedSessions: state.loggedSessions,
              points: state.points,
              streakData: state.streakData
            });
          }
          
          return newState;
        });
      },

      toggleTask: (taskId) => {
        set((state) => {
          let pointsEarned = 0;
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === taskId) {
              if (!task.completed) pointsEarned = 10; // Award 10 points for completion
              return { ...task, completed: !task.completed };
            }
            return task;
          });
          
          const newState = { 
            tasks: updatedTasks, 
            points: state.points + pointsEarned 
          };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: newState.tasks,
              loggedSessions: state.loggedSessions,
              points: newState.points,
              streakData: state.streakData
            });
          }
          
          return newState;
        });
      },

      logSession: (sessionData) => {
        set((state) => {
          const newSession = { 
            ...sessionData, 
            id: `sess-${sessionIdCounter++}` 
          };
          const newSessions = [...state.loggedSessions, newSession];
          const earnedPoints = Math.floor(sessionData.durationMinutes / 10); // 1 point per 10 mins
          
          // Update streak data
          const newStreakData = calculateStreak(newSessions);
          
          const newState = {
            loggedSessions: newSessions,
            points: state.points + earnedPoints,
            streakData: newStreakData
          };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: state.tasks,
              loggedSessions: newState.loggedSessions,
              points: newState.points,
              streakData: newState.streakData
            });
          }
          
          return newState;
        });
      },
        
      updateSession: (updatedSession) => {
        set((state) => {
          const updatedSessions = state.loggedSessions.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          );
          
          const newState = { loggedSessions: updatedSessions };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: state.tasks,
              loggedSessions: newState.loggedSessions,
              points: state.points,
              streakData: state.streakData
            });
          }
          
          return newState;
        });
      },
        
      deleteSession: (sessionId) => {
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
          
          const newState = { 
            loggedSessions: updatedSessions,
            points: Math.max(0, state.points - pointsToDeduct),
            streakData: newStreakData
          };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: state.tasks,
              loggedSessions: newState.loggedSessions,
              points: newState.points,
              streakData: newState.streakData
            });
          }
          
          return newState;
        });
      },
        
      updateStreak: () => {
        set((state) => {
          const newStreakData = calculateStreak(state.loggedSessions);
          
          const newState = { streakData: newStreakData };
          
          // Save to localStorage
          if (state.auth.currentUser) {
            saveUserData(state.auth.currentUser.id, {
              subjects: state.subjects,
              tasks: state.tasks,
              loggedSessions: state.loggedSessions,
              points: state.points,
              streakData: newState.streakData
            });
          }
          
          return newState;
        });
      }
    }),
    {
      name: 'study-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the base app data, not auth state
      partialize: (state) => ({
        // We don't store auth here since we handle it separately
        // via user-specific localStorage entries
      }),
    }
  )
);