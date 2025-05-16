import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Subject, Task, LoggedSession, User, AuthState, StreakData } from '../types';
import { format, isYesterday, isToday, subDays } from 'date-fns';
import * as FirestoreService from '../firebase/firestore';
import * as AuthService from '../firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

let subjectIdCounter = 0;
let taskIdCounter = 0;
let sessionIdCounter = 0;

interface UserStats {
  studyPoints: number;
  totalStudyHours?: number;
  completedTasks?: number;
}

type FirestoreUserDoc = {
  createdAt?: any;
  updatedAt?: any;
  streakData?: any;
  points?: number;
};

interface AppState {
  auth: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  
  isOnline: boolean;
  isSyncing: boolean;
  setOnlineStatus: (status: boolean) => void;
  syncWithFirebase: () => Promise<void>;

  subjects: Subject[];
  tasks: Task[];
  loggedSessions: LoggedSession[];
  points: number;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  logSession: (session: Omit<LoggedSession, 'id'>) => Promise<LoggedSession>;
  updateSession: (updatedSession: LoggedSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  
  streakData: StreakData;
  updateStreak: () => Promise<void>;
  
  userStats?: UserStats;
  
  fetchUserData: (userId: string) => Promise<void>;
}

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

const demoUserPasswords: Record<string, string> = {
  'student@example.com': 'password123',
  'admin@example.com': 'admin123'
};

const initialSubjects: Subject[] = [
  { id: 'subj-0', name: 'Mathematics', color: '#FF5252', targetHours: 10 },
  { id: 'subj-1', name: 'Programming', color: '#42A5F5', targetHours: 15 },
  { id: 'subj-2', name: 'Physics', color: '#FFB300', targetHours: 8 },
  { id: 'subj-3', name: 'Literature', color: '#9CCC65', targetHours: 6 },
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
    createdAt: new Date(Date.now() - 86400000),
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3)
  },
];

const initialStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null
};

const calculateStreak = (sessions: LoggedSession[]): StreakData => {
  if (sessions.length === 0) {
    return initialStreakData;
  }
  
  const sessionsByDate: Record<string, Date> = {};
  sessions.forEach(session => {
    const date = new Date(session.startTime);
    const dateKey = format(date, 'yyyy-MM-dd');
    sessionsByDate[dateKey] = date;
  });
  
  const dates = Object.values(sessionsByDate).sort((a, b) => b.getTime() - a.getTime());
  
  if (dates.length === 0) {
    return initialStreakData;
  }
  
  const mostRecentDate = dates[0];
  const isStreakActive = isToday(mostRecentDate) || isYesterday(mostRecentDate);
  
  if (!isStreakActive) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: mostRecentDate
    };
  }
  
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
      break;
    }
  }
  
  return {
    currentStreak,
    longestStreak: currentStreak,
    lastActiveDate: mostRecentDate
  };
};

const getUserData = (userId: string) => {
  const userDataKey = `study-tracker-user-${userId}`;
  const savedData = localStorage.getItem(userDataKey);
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      
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

const checkOnlineStatus = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true);
    useAppStore.getState().syncWithFirebase();
  });
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false);
  });
}

if (typeof window !== 'undefined') {
  AuthService.subscribeToAuthChanges(async (firebaseUser: FirebaseUser | null) => {
    const store = useAppStore.getState();
    
    if (firebaseUser) {
      const userData = AuthService.mapFirebaseUser(firebaseUser);
      const user = {
        ...userData,
        points: 0,
        subjects: [],
        tasks: [],
        loggedSessions: []
      } as User;
      
      store.setCurrentUser(user);
      
      try {
        await store.fetchUserData(user.id);
      } catch (error) {
        console.error("Error fetching user data from Firestore:", error);
        const localData = getUserData(user.id);
        if (localData) {
          store.setCurrentUser({
            ...user,
            points: localData.points || 0
          });
          
          initializeCounters(localData);
          
          (store as any).setState({
            subjects: localData.subjects || [],
            tasks: localData.tasks || [],
            loggedSessions: localData.loggedSessions || [],
            points: localData.points || 0,
            streakData: localData.streakData || initialStreakData,
            userStats: {
              studyPoints: localData.points || 0,
              totalStudyHours: 0,
              completedTasks: 0
            }
          });
        }
      }
    } else {
      store.setCurrentUser(null);
    }
  });
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      auth: {
        isAuthenticated: false,
        currentUser: null,
        error: null
      },
      
      isOnline: checkOnlineStatus(),
      isSyncing: false,
      
      setOnlineStatus: (status) => set({ isOnline: status }),
      
      syncWithFirebase: async () => {
        const state = get();
        
        if (!state.isOnline || !state.auth.isAuthenticated || !state.auth.currentUser) {
          return;
        }
        
        set({ isSyncing: true });
        
        try {
          for (const subject of state.subjects) {
            if (subject.id.startsWith('subj-')) {
              await FirestoreService.addSubject(state.auth.currentUser.id, {
                name: subject.name,
                color: subject.color,
                targetHours: subject.targetHours
              });
            }
          }
          
          for (const task of state.tasks) {
            if (task.id.startsWith('task-')) {
              await FirestoreService.addTask(state.auth.currentUser.id, {
                subjectId: task.subjectId,
                description: task.description,
                priority: task.priority,
                dueDate: task.dueDate
              });
            } else {
              await FirestoreService.updateTask(task.id, {
                completed: task.completed
              });
            }
          }
          
          for (const session of state.loggedSessions) {
            if (session.id.startsWith('sess-')) {
              await FirestoreService.addLoggedSession(state.auth.currentUser.id, {
                subjectId: session.subjectId,
                taskId: session.taskId,
                startTime: session.startTime,
                endTime: session.endTime,
                durationMinutes: session.durationMinutes,
                notes: session.notes,
                focusScore: session.focusScore,
                distractionsLogged: session.distractionsLogged,
                tasksCompleted: session.tasksCompleted,
                materials: session.materials,
                tags: session.tags
              });
            }
          }
          
          await FirestoreService.updateUserPoints(state.auth.currentUser.id, state.points);
          
          await FirestoreService.updateUserStreak(state.auth.currentUser.id, state.streakData);
          
          await get().fetchUserData(state.auth.currentUser.id);
        } catch (error) {
          console.error('Error syncing with Firebase:', error);
        } finally {
          set({ isSyncing: false });
        }
      },

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
          try {
            const user = await AuthService.signIn(email, password);
            if (user) {
              return true;
            }
            return false;
          } catch (firebaseError) {
            console.warn('Firebase login failed, falling back to demo accounts:', firebaseError);
            
            if (demoUserPasswords[email] === password) {
              const user = demoUsers.find(u => u.email === email);
              if (user) {
                const savedData = getUserData(user.id);
                
                if (savedData) {
                  initializeCounters(savedData);
                }
                
                const userData = {
                  subjects: savedData?.subjects || initialSubjects,
                  tasks: savedData?.tasks || initialTasks,
                  loggedSessions: savedData?.loggedSessions || [],
                  points: savedData?.points !== undefined ? savedData.points : (user.email === 'admin@example.com' ? 100 : 0),
                  streakData: savedData?.streakData || initialStreakData,
                  userStats: {
                    studyPoints: savedData?.points || 0,
                    totalStudyHours: 0,
                    completedTasks: 0
                  }
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
          const user = await AuthService.signUp(email, password, displayName);
          if (user) {
            set({
              subjects: initialSubjects,
              tasks: initialTasks,
              loggedSessions: [],
              points: 0,
              streakData: initialStreakData,
              userStats: {
                studyPoints: 0,
                totalStudyHours: 0,
                completedTasks: 0
              }
            });
            
            await get().syncWithFirebase();
            
            return true;
          }
          return false;
        } catch (error: any) {
          console.error('Sign up error:', error);
          set(state => ({
            auth: {
              ...state.auth,
              error: error.message || 'An error occurred during sign up'
            }
          }));
          return false;
        }
      },

      logout: async () => {
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
          
          if (get().isOnline) {
            try {
              await AuthService.logOut();
            } catch (error) {
              console.error('Error signing out from Firebase:', error);
            }
          }
        }
        
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
          streakData: initialStreakData,
          userStats: {
            studyPoints: 0,
            totalStudyHours: 0,
            completedTasks: 0
          }
        });
      },

      subjects: initialSubjects,
      tasks: initialTasks,
      loggedSessions: [],
      points: 0,
      streakData: initialStreakData,
      userStats: {
        studyPoints: 0,
        totalStudyHours: 0,
        completedTasks: 0
      },

      fetchUserData: async (userId) => {
        try {
          set({ isSyncing: true });
          
          const subjects = await FirestoreService.getSubjects(userId);
          
          const tasks = await FirestoreService.getTasks(userId);
          
          const loggedSessions = await FirestoreService.getLoggedSessions(userId);
          
          const userData = await FirestoreService.getUserData(userId) as FirestoreUserDoc;
          
          if (subjects.length > 0 || tasks.length > 0 || loggedSessions.length > 0) {
            const data = { subjects, tasks, loggedSessions };
            initializeCounters(data);
          }
          
          set({
            subjects: subjects.length > 0 ? subjects : initialSubjects,
            tasks: tasks.length > 0 ? tasks : initialTasks,
            loggedSessions: loggedSessions || [],
            points: userData?.points || 0,
            streakData: userData?.streakData || initialStreakData,
            userStats: {
              studyPoints: userData?.points || 0,
              totalStudyHours: 0,
              completedTasks: 0
            }
          });
          
          saveUserData(userId, {
            subjects,
            tasks,
            loggedSessions,
            points: userData?.points || 0,
            streakData: userData?.streakData || initialStreakData
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          const localData = getUserData(userId);
          if (localData) {
            set({
              subjects: localData.subjects || initialSubjects,
              tasks: localData.tasks || initialTasks,
              loggedSessions: localData.loggedSessions || [],
              points: localData.points || 0,
              streakData: localData.streakData || initialStreakData,
              userStats: {
                studyPoints: localData.points || 0,
                totalStudyHours: 0,
                completedTasks: 0
              }
            });
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      addSubject: async (subjectData) => {
        const state = get();
        const newSubject = { ...subjectData, id: `subj-${subjectIdCounter++}` };
        
        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: [...state.subjects, newSubject],
            tasks: state.tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            const addedSubject = await FirestoreService.addSubject(state.auth.currentUser.id, subjectData);
            if (addedSubject) {
              set((state) => ({
                subjects: state.subjects.map(s => 
                  s.id === newSubject.id ? { ...s, id: addedSubject.id } : s
                ),
              }));
              
              if (state.auth.currentUser) {
                saveUserData(state.auth.currentUser.id, {
                  subjects: get().subjects,
                  tasks: state.tasks,
                  loggedSessions: state.loggedSessions,
                  points: state.points,
                  streakData: state.streakData
                });
              }
            }
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
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: [...state.tasks, newTask],
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            const addedTask = await FirestoreService.addTask(state.auth.currentUser.id, taskData);
            if (addedTask) {
              set((state) => ({
                tasks: state.tasks.map(t => 
                  t.id === newTask.id ? { ...t, id: addedTask.id } : t
                ),
              }));
              
              if (state.auth.currentUser) {
                saveUserData(state.auth.currentUser.id, {
                  subjects: state.subjects,
                  tasks: get().tasks,
                  loggedSessions: state.loggedSessions,
                  points: state.points,
                  streakData: state.streakData
                });
              }
            }
          } catch (error) {
            console.error('Error adding task to Firebase:', error);
          }
        }
      },

      toggleTask: async (taskId) => {
        const state = get();
        let pointsEarned = 0;
        let updatedTask: Task | null = null;
        
        set((state) => {
          const updatedTasks = state.tasks.map((task) => {
            if (task.id === taskId) {
              if (!task.completed) pointsEarned = 10;
              updatedTask = { ...task, completed: !task.completed };
              return updatedTask;
            }
            return task;
          });
          return { 
            tasks: updatedTasks, 
            userStats: {
              ...state.userStats || { studyPoints: 0 },
              studyPoints: (state.userStats?.studyPoints || 0) + pointsEarned
            }
          };
        });
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: get().tasks,
            loggedSessions: state.loggedSessions,
            points: get().points,
            streakData: state.streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser && updatedTask) {
          try {
            const taskUpdate = {
              completed: (updatedTask as Task).completed
            };
            
            await FirestoreService.updateTask(taskId, taskUpdate);
            
            if (pointsEarned > 0) {
              await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            }
          } catch (error) {
            console.error('Error updating task in Firebase:', error);
          }
        }
      },

      deleteTask: async (taskId) => {
        const state = get();
        
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }));
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: get().tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            if (!taskId.startsWith('task-')) {
              await FirestoreService.deleteTask(taskId);
            }
          } catch (error) {
            console.error('Error deleting task from Firebase:', error);
          }
        }
      },

      logSession: async (sessionData) => {
        const state = get();
        const newSession = { 
          ...sessionData, 
          id: `sess-${sessionIdCounter++}` 
        };
        const earnedPoints = Math.floor(sessionData.durationMinutes / 10);
        
        set((state) => {
          const newSessions = [...state.loggedSessions, newSession];
          const newStreakData = calculateStreak(newSessions);
          
          return {
            loggedSessions: newSessions,
            userStats: {
              ...state.userStats || { studyPoints: 0 },
              studyPoints: (state.userStats?.studyPoints || 0) + earnedPoints
            },
            streakData: newStreakData
          };
        });
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: get().points,
            streakData: get().streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            const addedSession = await FirestoreService.addLoggedSession(state.auth.currentUser.id, sessionData);
            
            if (addedSession) {
              set((state) => ({
                loggedSessions: state.loggedSessions.map(s => 
                  s.id === newSession.id ? { ...s, id: addedSession.id } : s
                ),
              }));
              
              if (state.auth.currentUser) {
                saveUserData(state.auth.currentUser.id, {
                  subjects: state.subjects,
                  tasks: state.tasks,
                  loggedSessions: get().loggedSessions,
                  points: get().points,
                  streakData: get().streakData
                });
              }
            }
            
            await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            await FirestoreService.updateUserStreak(state.auth.currentUser.id, get().streakData);
          } catch (error) {
            console.error('Error adding session to Firebase:', error);
          }
        }
        
        return newSession;
      },
        
      updateSession: async (updatedSession) => {
        const state = get();
        
        set((state) => {
          const updatedSessions = state.loggedSessions.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          );
          return { loggedSessions: updatedSessions };
        });
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: state.points,
            streakData: state.streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            if (!updatedSession.id.startsWith('sess-')) {
              await FirestoreService.updateLoggedSession(updatedSession.id, updatedSession);
            }
          } catch (error) {
            console.error('Error updating session in Firebase:', error);
          }
        }
      },
        
      deleteSession: async (sessionId) => {
        const state = get();
        const deletedSession = state.loggedSessions.find(session => session.id === sessionId);
        
        set((state) => {
          const updatedSessions = state.loggedSessions.filter(session => session.id !== sessionId);
          
          let pointsToDeduct = 0;
          if (deletedSession) {
            pointsToDeduct = Math.floor(deletedSession.durationMinutes / 10);
          }
          
          const newStreakData = calculateStreak(updatedSessions);
          
          return { 
            loggedSessions: updatedSessions,
            userStats: {
              ...state.userStats || { studyPoints: 0 },
              studyPoints: Math.max(0, (state.userStats?.studyPoints || 0) - pointsToDeduct)
            },
            streakData: newStreakData
          };
        });
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: get().loggedSessions,
            points: get().points,
            streakData: get().streakData
          });
        }
        
        if (state.isOnline && state.auth.currentUser) {
          try {
            if (!sessionId.startsWith('sess-')) {
              await FirestoreService.deleteLoggedSession(sessionId);
            }
            
            await FirestoreService.updateUserPoints(state.auth.currentUser.id, get().points);
            await FirestoreService.updateUserStreak(state.auth.currentUser.id, get().streakData);
          } catch (error) {
            console.error('Error deleting session from Firebase:', error);
          }
        }
      },
        
      updateStreak: async () => {
        const state = get();
        
        set((state) => {
          const newStreakData = calculateStreak(state.loggedSessions);
          return { streakData: newStreakData };
        });
        
        if (state.auth.currentUser) {
          saveUserData(state.auth.currentUser.id, {
            subjects: state.subjects,
            tasks: state.tasks,
            loggedSessions: state.loggedSessions,
            points: state.points,
            streakData: get().streakData
          });
        }
        
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
      partialize: (state) => ({
        isOnline: state.isOnline
      }),
    }
  )
);
