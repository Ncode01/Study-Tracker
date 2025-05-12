// src/store/appStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subject, Task, LoggedSession, User, AuthState, StreakData } from '../types';
import { format, isYesterday, isToday, subDays } from 'date-fns';
import * as FirestoreService from '../firebase/firestore';
import * as AuthService from '../firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AppState {
  // Auth state
  auth: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  
  // Network and sync state
  isOnline: boolean;
  isSyncing: boolean;
  setOnlineStatus: (status: boolean) => void;
  syncWithFirebase: () => Promise<void>;

  // App data
  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
  points: number;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  logSession: (session: Omit<LoggedSession, 'id'>) => Promise<void>;
  updateSession: (updatedSession: LoggedSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  
  // Streak data
  streakData: StreakData;
  updateStreak: () => Promise<void>;
  
  // Data fetching
  fetchUserData: (userId: string) => Promise<void>;
}

let subjectIdCounter = 2; // Start from 2 because we have initial data
let taskIdCounter = 3; // Start from 3 because we have initial data
let sessionIdCounter = 1;

// Hardcoded user accounts for demo use when Firebase is not configured
const demoUsers: User[] = [
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
const demoUserPasswords: Record<string, string> = {
  'student@example.com': 'password123',
  'admin@example.com': 'admin123'
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

// Helper functions to handle user data persistence in localStorage (for offline use)
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

// Check if we're currently online
const checkOnlineStatus = () => {
  return navigator.onLine;
};

// Set up network status listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
    // Attempt to sync data when we come back online
    useAppStore.getState().syncWithFirebase();
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}

// Listen for Firebase auth state changes
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let authUnsubscribe: (() => void) | null = null;
if (typeof window !== 'undefined') {
  authUnsubscribe = AuthService.subscribeToAuthChanges(async (firebaseUser: FirebaseUser | null) => {
    const store = useAppStore.getState();
    
    if (firebaseUser) {
      // User is signed in
      const userData = AuthService.mapFirebaseUser(firebaseUser);
      const user = {
        ...userData,
        points: 0,
        subjects: [],
        tasks: [],
        loggedSessions: []
      } as User;
      
      store.setCurrentUser(user);
      
      // Fetch user data from Firestore and update the store
      try {
        await store.fetchUserData(user.id);
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        // Fallback to localStorage if Firestore fetch fails
        const localData = getUserData(user.id);
        if (localData) {
          store.setCurrentUser({
            ...user,
            points: localData.points || 0
          });
          
          initializeCounters(localData);
          
          // Update store with local data
          (store as any).setState({
            subjects: localData.subjects || [],
            tasks: localData.tasks || [],
            loggedSessions: localData.loggedSessions || [],
            points: localData.points || 0,
            streakData: localData.streakData || initialStreakData
          });
        }
      }
    } else {
      // User is signed out
      store.setCurrentUser(null);
    }
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      auth: {
        isAuthenticated: false,
        currentUser: null,
        error: null
      },
      
      // Network and sync state
      isOnline: checkOnlineStatus(),
      isSyncing: false,
      
      setOnlineStatus: (status) => set({ isOnline: status }),
      
      syncWithFirebase: async () => {
        const state = get();
        
        // Only try to sync if online and authenticated
        if (!state.isOnline || !state.auth.isAuthenticated || !state.auth.currentUser) {
          return;
        }
        
        set({ isSyncing: true });
        
        try {
          // Sync data with Firebase
          await FirestoreService.syncUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
          
          // Update user points
          await FirestoreService.updateUserPoints(state.auth.currentUser.id, state.points);
          
          // Update user streak
          await FirestoreService.updateUserStreak(state.auth.currentUser.id, state.streakData);
        } catch (error) {
          console.error('Error syncing with Firebase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

      // Authentication methods
      setCurrentUser: (user) => {
        set({
          auth: {
            isAuthenticated: !!user,
            currentUser: user,
            error: null
          }
        });
      },
      
      login: async (email, password) => {
        try {
          // Try Firebase auth first
          try {
            await AuthService.signIn(email, password);
            return true;
          } catch (firebaseError) {
            console.warn('Firebase login failed, falling back to demo accounts:', firebaseError);
            
            // Fall back to demo accounts if Firebase auth fails
            if (demoUserPasswords[email] === password) {
              const user = demoUsers.find(u => u.email === email);
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
                  points: savedData?.points !== undefined ? savedData.points : (user.email === 'admin@example.com' ? 100 : 0),
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
                error: 'Invalid email or password'
              }
            }));
            return false;
          }
        } catch (error) {
          console.error('Login error:', error);
          set(state => ({
            auth: {
              ...state.auth,
              error: 'An error occurred during login'
            }
          }));
          return false;
        }
      },
      
      signUp: async (email, password, displayName) => {
        try {
          await AuthService.signUp(email, password, displayName);
          return true;
        } catch (error) {
          console.error('Sign up error:', error);
          set(state => ({
            auth: {
              ...state.auth,
              error: 'An error occurred during sign up'
            }
          }));
          return false;
        }
      },

      logout: async () => {
        // Save current state to localStorage before logging out
        const { auth, subjects, tasks, loggedSessions, points, streakData } = get();
        
        if (auth.currentUser) {
          // Save to localStorage for offline backup
          const userData = {
            subjects,
            tasks,
            loggedSessions,
            points,
            streakData
          };
          
          saveUserData(auth.currentUser.id, userData);
          
          // Try to sign out from Firebase if online
          if (get().isOnline) {
            try {
              await AuthService.logOut();
            } catch (error) {
              console.error('Error signing out from Firebase:', error);
            }
          }
        }
        
        // Reset app state regardless of Firebase signout success
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

      // Data state
      subjects: initialSubjects,
      tasks: initialTasks,
      loggedSessions: [],
      points: 0,
      streakData: initialStreakData,

      // Data fetching
      fetchUserData: async (userId) => {
        try {
          set({ isSyncing: true });
          
          // Get user subjects
          const subjects = await FirestoreService.getSubjects(userId);
          
          // Get user tasks
          const tasks = await FirestoreService.getTasks(userId);
          
          // Get user sessions
          const loggedSessions = await FirestoreService.getLoggedSessions(userId);
          
          // Get user data (points, streak, etc.)
          const userData = await FirestoreService.getUserData(userId);
          
          // Update state with fetched data
          set({
            subjects: subjects.length > 0 ? subjects : initialSubjects,
            tasks: tasks.length > 0 ? tasks : initialTasks,
            loggedSessions: loggedSessions || [],
            points: userData?.points || 0,
            streakData: userData?.streakData || initialStreakData
          });
          
          // Also save to localStorage as backup
          saveUserData(userId, {
            subjects,
            tasks,
            loggedSessions,
            points: userData?.points || 0,
            streakData: userData?.streakData || initialStreakData
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Fall back to localStorage
          const localData = getUserData(userId);
          if (localData) {
            set({
              subjects: localData.subjects || initialSubjects,
              tasks: localData.tasks || initialTasks,
              loggedSessions: localData.loggedSessions || [],
              points: localData.points || 0,
              streakData: localData.streakData || initialStreakData
            });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      // Create, update, delete methods
      addSubject: async (subjectData) => {
        const state = get();
        const newSubject = { ...subjectData, id: `subj-${subjectIdCounter++}` };
        
        // Update local state immediately
        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: [...state.subjects, newSubject],
            tasks: state.tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.addSubject(state.auth.currentUser.id, subjectData);
          } catch (error) {
            console.error('Error adding subject to Firebase:', error);
          }
        }
      },

      addTask: async (taskData) => {
        const state = get();
        const newTask = { 
          ...taskData, 
          id: `task-${taskIdCounter++}`, 
          completed: false, 
          createdAt: new Date() 
        };
        
        // Update local state immediately
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: [...state.tasks, newTask],
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.addTask(state.auth.currentUser.id, taskData);
          } catch (error) {
            console.error('Error adding task to Firebase:', error);
          }
        }
      },

      toggleTask: async (taskId) => {
        const state = get();
        let pointsEarned = 0;
        let updatedTask: Task | null = null;
        
        // Update local state immediately
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === taskId) {
              if (!task.completed) pointsEarned = 10; // Award 10 points for completion
              updatedTask = { ...task, completed: !task.completed };
              return updatedTask;
            }
            return task;
          });
          return { 
            tasks: updatedTasks, 
            points: state.points + pointsEarned 
          };
        });
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: get().tasks,
            loggedSessions: state.loggedSessions,
            points: get().points,
            streakData: state.streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser && updatedTask) {
          try {
            await FirestoreService.updateTask(taskId, { 
              completed: updatedTask.completed as boolean 
            });
            
            // Update user points in Firestore
            if (pointsEarned > 0) {
              await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            }
          } catch (error) {
            console.error('Error updating task in Firebase:', error);
          }
        }
      },

      logSession: async (sessionData) => {
        const state = get();
        const newSession = { 
          ...sessionData, 
          id: `sess-${sessionIdCounter++}` 
        };
        const earnedPoints = Math.floor(sessionData.durationMinutes / 10); // 1 point per 10 mins
        
        // Update local state immediately
        set((state) => {
          const newSessions = [...state.loggedSessions, newSession];
          // Update streak data
          const newStreakData = calculateStreak(newSessions);
          
          return {
            loggedSessions: newSessions,
            points: state.points + earnedPoints,
            streakData: newStreakData
          };
        });
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: get().points,
            streakData: get().streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.addLoggedSession(state.auth.currentUser.id, sessionData);
            
            // Update user points and streak in Firestore
            await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            await FirestoreService.updateUserStreak(state.auth.currentUser.id, get().streakData);
          } catch (error) {
            console.error('Error adding session to Firebase:', error);
          }
        }
      },
        
      updateSession: async (updatedSession) => {
        const state = get();
        
        // Update local state immediately
        set((state) => {
          const updatedSessions = state.loggedSessions.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          );
          return { loggedSessions: updatedSessions };
        });
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.updateLoggedSession(updatedSession.id, updatedSession);
          } catch (error) {
            console.error('Error updating session in Firebase:', error);
          }
        }
      },
        
      deleteSession: async (sessionId) => {
        const state = get();
        const deletedSession = state.loggedSessions.find(session => session.id === sessionId);
        
        // Update local state immediately
        set((state) => {
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
        });
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: get().points,
            streakData: get().streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.deleteLoggedSession(sessionId);
            
            // Update user points and streak in Firestore
            await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            await FirestoreService.updateUserStreak(state.auth.currentUser.id, get().streakData);
          } catch (error) {
            console.error('Error deleting session from Firebase:', error);
          }
        }
      },
        
      updateStreak: async () => {
        const state = get();
        
        // Update local state immediately
        set((state) => {
          const newStreakData = calculateStreak(state.loggedSessions);
          return { streakData: newStreakData };
        });
        
        // Save to localStorage as backup
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: get().streakData
          });
        }
        
        // Sync with Firebase if online
        if (state.isOnline && state.auth.currentUser) {
          try {
            await FirestoreService.updateUserStreak(state.auth.currentUser.id, get().streakData);
          } catch (error) {
            console.error('Error updating streak in Firebase:', error);
          }
        }
      }
    }),
    {
      name: 'study-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist network status for the Zustand persist middleware
      partialize: (state) => ({
        isOnline: state.isOnline
      }),
    }
  )
);